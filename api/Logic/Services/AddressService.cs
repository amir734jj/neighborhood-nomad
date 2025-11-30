using EfCoreRepository.Interfaces;
using Logic.Abstracts;
using Logic.Interfaces;
using Models.Entities;

namespace Logic.Services;

public class AddressService(IEfRepository repository) : BasicCrudLogicAbstract<Address>, IAddressService
{
    protected override IBasicCrud<Address> Repository()
    {
        return repository.For<Address>();
    }
}