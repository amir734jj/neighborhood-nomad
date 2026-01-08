using System;
using System.Linq;
using System.Threading.Tasks;
using EfCoreRepository.Extensions;
using EfCoreRepository.Interfaces;
using Hangfire;
using Logic.Abstracts;
using Logic.Interfaces;
using Models.Entities;
using Newtonsoft.Json;

namespace Logic.Services;

public class PersistentCacheService(IEfRepository repository) : JobBaseAbstract(Cron.Minutely()), IPersistentCacheService
{
    private IBasicCrud<PersistentCacheItem> BasicCrud => repository.For<PersistentCacheItem>().SplitQuery();

    public async Task CreateOrUpdate<T>(string key, T value, TimeSpan? expires = null) where T : class, new()
    {
        expires ??= TimeSpan.FromHours(1);
        var items = (await BasicCrud.GetAll(filterExprs: [x => x.Key == key], maxResults: 1)).ToList();

        if (items.Count != 0)
        {
            await BasicCrud.Update(items.First().Id, x =>
            {
                x.Value = JsonConvert.SerializeObject(value);
                x.AccessTime = DateTimeOffset.UtcNow;
            });
        }
        else
        {
            await BasicCrud.Save(new PersistentCacheItem
            {
                Key = key,
                Value = JsonConvert.SerializeObject(value),
                AccessTime = DateTimeOffset.UtcNow,
                CreatedTime =  DateTimeOffset.UtcNow,
                Expires = expires.Value
            });
        }
    }

    public async Task<bool> Delete(string key)
    {
        var item = await BasicCrud.Delete([
            x => x.Key == key
        ]);
        
        return item != null;
    }

    public async Task<(bool Success, T? Value)> TryGet<T>(string key) where T : class, new()
    {
        var items = (await BasicCrud.GetAll(filterExprs: [x => x.Key == key], maxResults: 1)).ToList();

        return items.Count != 0 ? (true, JsonConvert.DeserializeObject<T>(items.First().Value)!) : (false, null);
    }

    public override async Task ExecuteAsync()
    {
        var items = (await BasicCrud.GetAll([
            persistentCacheItem => DateTimeOffset.UtcNow - persistentCacheItem.AccessTime > persistentCacheItem.Expires
        ])).ToList();

        foreach (var item in items)
        {
            await Delete(item.Key);
        }
    }
}
