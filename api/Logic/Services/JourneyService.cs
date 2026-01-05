using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EfCoreRepository.Interfaces;
using Logic.Abstracts;
using Logic.Extensions;
using Logic.Interfaces;
using Microsoft.AspNetCore.Http;
using Models.Entities;

namespace Logic.Services;

public class JourneyService(IEfRepository repository, IStopService stopService, IHttpContextAccessor httpContextAccessor) : BasicCrudLogicAbstract<Journey>, IJourneyService
{
    protected override IBasicCrud<Journey> Repository()
    {
        return repository.For<Journey>();
    }

    public override async Task<IEnumerable<Journey>> GetAll()
    {
        var user = await httpContextAccessor.HttpContext.GetUser();
        
        return await this.GetAllHelper(filterExprs: [
            x => x.Email == user!.Email
        ]);
    }

    public override async Task<Journey> Delete(Guid id)
    {
        var  entity = await Get(id);
        
        var user = await httpContextAccessor.HttpContext.GetUser();
        var role = await httpContextAccessor.HttpContext.GetRole();

        if (!(role!.IsAdminRole() || user!.HasSameEmail(entity!.Email)))
        {
            throw new UnauthorizedAccessException();
        }

        return await base.Delete(id);
    }

    public override async Task<Journey> Update(Guid id, Journey dto)
    {
        var user = await httpContextAccessor.HttpContext.GetUser();
        var role = await httpContextAccessor.HttpContext.GetRole();

        if (!(role!.IsAdminRole() || user!.HasSameEmail(dto.Email)))
        {
            throw new UnauthorizedAccessException();
        }
        
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
                dtoStop.JourneyId = entity.Id;
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
