using System;
using System.Threading.Tasks;

namespace Logic.Interfaces;

public interface IPersistentCacheService : IJob
{
    public Task CreateOrUpdate<T>(string key, T value, TimeSpan? expires = null) where T : class, new();
    
    public Task<bool> Delete(string key);

    public Task<(bool Success, T? Value)> TryGet<T>(string key) where T : class, new();
}