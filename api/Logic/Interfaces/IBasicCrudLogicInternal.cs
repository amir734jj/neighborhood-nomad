using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Models.Interfaces;

namespace Logic.Interfaces;

public interface IBasicCrudLogicInternal<T> where T : class, IEntity
{
    internal Task<T> Update(int id, Action<T> modifyAction);

    internal Task<IEnumerable<TProject>> GetAllHelper<TProject>(
        Expression<Func<T, bool>>[]? filterExprs = null,
        Func<IQueryable<T>, IQueryable<T>>? includeExprs = null,
        Expression<Func<T, object>>? orderBy = null,
        Expression<Func<T, object>>? orderByDesc = null,
        Expression<Func<T, TProject>>? project = null,
        int? maxResults = null) where TProject : class, new();

    internal Task<IEnumerable<T>> DeleteMany(params int[] ids);
    
    internal Task<IEnumerable<T>> BulkUpdate(int[] ids, Action<T> modifyAction);
    
    internal Task<IEnumerable<T>> SaveMany(params T[] entities);
}