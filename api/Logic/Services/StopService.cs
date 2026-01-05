using System;
using System.Threading.Tasks;
using EfCoreRepository.Interfaces;
using Logic.Abstracts;
using Logic.Interfaces;
using Models.Entities;

namespace Logic.Services;

public class StopService(IEfRepository repository, IAddressService addressService) : BasicCrudLogicAbstract<Stop>, IStopService
{
    protected override IBasicCrud<Stop> Repository()
    {
        return repository.For<Stop>();
    }

    public override async Task<Stop> Update(Guid id, Stop dto)
    {
        var entity = (await Get(id))!;
        
        if (dto.Address is null)
        {
            if (entity.Address is not null)
            {
                await addressService.Delete(entity.Address.Id);
            }
        }
        // made-up conversion to signal it's a new row
        else if (dto.Address.Id != Guid.Empty)
        {
            await addressService.Update(dto.Address.Id, dto.Address);
        }
        else
        {
            await addressService.Save(dto.Address);
        }
        
        return await base.Update(id, dto);
    }
}