using System.Linq;
using System.Threading.Tasks;
using EfCoreRepository.Interfaces;
using Logic.Abstracts;
using Logic.Interfaces;
using Models.Entities;

namespace Logic.Services;

public class JourneyService(IEfRepository repository, IStopService stopService) : BasicCrudLogicAbstract<Journey>, IJourneyService
{
    protected override IBasicCrud<Journey> Repository()
    {
        return repository.For<Journey>();
    }

    public override async Task<Journey> Update(int id, Journey dto)
    {
        var entity = (await Get(id))!;

        if (!entity.Photos.ToHashSet().Equals(dto.Photos))
        {
            await Update(entity.Id, x =>
            {
                x.Photos = dto.Photos.Distinct().ToArray();
            });
        }
        
        // Apply deletions
        foreach (var entityStop in entity.Stops.Where(x => dto.Stops.All(y => x.Id != y.Id)))
        {
            await stopService.Delete(entityStop.Id);
        }

        foreach (var (dtoStop, index) in dto.Stops.Select((stop, index) => (stop, index)))
        {
            var entityStop = entity.Stops.FirstOrDefault(x => x.Id == dtoStop.Id);

            // Apply additions
            if (entityStop == null)
            {
                entityStop = await stopService.Save(dtoStop);
            }
            // Apply updates
            else
            {
                await stopService.Update(entityStop.Id, dtoStop);
            }

            // Apply re-ordering
            if (dtoStop.Number != entityStop.Number)
            {
                await stopService.Update(entityStop.Id, x =>
                {
                    x.Number = index;
                });
            }
        }

        return await base.Update(id, dto);
    }
}