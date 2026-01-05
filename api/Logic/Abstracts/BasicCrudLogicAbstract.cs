using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using EfCoreRepository.Interfaces;
using Logic.Interfaces;
using Models.Interfaces;

namespace Logic.Abstracts;

public abstract class BasicCrudLogicAbstract<T> : IBasicCrudLogic<T>, IBasicCrudLogicInternal<T> where T : class, IEntity, new()
{
    protected async Task<IEnumerable<T>> GetAll(int[] ids)
    {
        // If no ids is specified, don't return all entities 
        return ids.Length == 0 ? [] : await Repository().GetAll(ids);
    }
    
    public virtual async Task<IEnumerable<T>> GetAll()
    {
        // Default behavior is his method retrieves only the top-level entities without including related fields.  
        // For additional properties, use GetById or GetAllHelper with custom includes.  
        // This optimization improves website load time by avoiding unnecessary data fetching.  
        // Additionally, related collections are ignored in JSON serialization due to [JsonIgnore],  
        // ensuring they are not sent to the front end, but they are still included. So be careful.
        return await Repository().NoTracking().GetAll<T>(includeExprs: x => x);
    }

    // Non-overridable
    public async Task<IEnumerable<TProject>> GetAllHelper<TProject>(
        Expression<Func<T, bool>>[]? filterExprs = null,
        Func<IQueryable<T>, IQueryable<T>>? includeExprs = null,
        Expression<Func<T, object>>? orderBy = null,
        Expression<Func<T, object>>? orderByDesc = null,
        Expression<Func<T, TProject>>? project = null,
        int? maxResults = null) where TProject : class, new()
    {
        return await Repository().NoTracking().GetAll(
            filterExprs: filterExprs,
            includeExprs: includeExprs,
            orderBy: orderBy,
            orderByDesc: orderByDesc,
            project: project,
            maxResults: maxResults);
    }

    public async Task<IEnumerable<T>> DeleteMany(params Guid[] ids)
    {
        return await Repository().DeleteMany(ids);
    }

    public async Task<IEnumerable<T>> BulkUpdate(Guid[] ids, Action<T> modifyAction)
    {
        return await Repository().BulkUpdate(ids, modifyAction, batchSize: 100);
    }

    public async Task<IEnumerable<T>> SaveMany(params T[] entities)
    {
        return await Repository().SaveMany(entities);
    }

    public async Task<IEnumerable<T>> GetAllFiltered(Guid[] ids)
    {
        return await Repository().GetAll(ids);
    }

    public async Task<bool> CanBeDeleted(Guid id)
    {
        var entity = await Get(id);

        return !await Repository().HasReferences(entity!);
    }

    public virtual async Task<T?> Get(Guid id)
    {
        return await Repository().Get(id);
    }

    public virtual async Task<T> Save(T dto)
    {
        var result = await Repository().Save(dto);
        
        // Default repository implementation does do an extra select, it returns entity cache
        // Hence, an extra select
        return (await Get(result.Id))!;
    }

    public virtual async Task<T> Delete(Guid id)
    {
        return await Repository().Delete(id);
    }

    public virtual async Task<T> Update(Guid id, T dto)
    {
        await Repository().Update(id, dto);

        // Default repository implementation does do an extra select, it returns entity cache
        // Hence, an extra select
        return (await Get(id))!;
    }

    public virtual async Task<T> Update(Guid id, Action<T> modifyAction)
    {
        await Repository().Update(id, modifyAction);
        
        // Default repository implementation does do an extra select, it returns entity cache
        // Hence, an extra select
        return (await Get(id))!;
    }

    protected abstract IBasicCrud<T> Repository();
}