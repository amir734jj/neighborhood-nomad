using System.Collections.Generic;
using System.Threading.Tasks;
using Models.Interfaces;

namespace Logic.Interfaces;

public interface IBasicCrudLogic<T> where T : class, IEntity
{
    Task<IEnumerable<T>> GetAll();

    Task<T?> Get(int id);

    Task<T> Save(T dto);

    Task<T> Delete(int id);

    Task<T> Update(int id, T dto);
    
    Task<IEnumerable<T>> GetAllFiltered(int[] ids);
    
    Task<bool> CanBeDeleted(int id);
}