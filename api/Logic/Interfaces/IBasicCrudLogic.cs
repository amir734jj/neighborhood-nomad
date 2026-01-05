using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models.Interfaces;

namespace Logic.Interfaces;

public interface IBasicCrudLogic<T> where T : class, IEntity
{
    Task<IEnumerable<T>> GetAll();

    Task<T?> Get(Guid id);

    Task<T> Save(T dto);

    Task<T> Delete(Guid id);

    Task<T> Update(Guid id, T dto);
    
    Task<IEnumerable<T>> GetAllFiltered(Guid[] ids);
    
    Task<bool> CanBeDeleted(Guid id);
}