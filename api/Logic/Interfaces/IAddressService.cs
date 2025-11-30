using Models.Entities;

namespace Logic.Interfaces;

public interface IAddressService: IBasicCrudLogic<Address>, IBasicCrudLogicInternal<Address>;