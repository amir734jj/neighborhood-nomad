using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Logic.Interfaces;
using Models.Interfaces;

namespace Logic.Extensions;

public static class BasicCrudLogicExtension
{
    public static async Task<IEnumerable<T>> GetAllHelper<T>(
        this IBasicCrudLogicInternal<T> crudLogic,
        Expression<Func<T, bool>>[]? filterExprs = null,
        Func<IQueryable<T>, IQueryable<T>>? includeExprs = null,
        Expression<Func<T, object>>? orderBy = null,
        Expression<Func<T, object>>? orderByDesc = null,
        int? maxResults = null) where T : class, IEntity, new()
    {
        return await crudLogic.GetAllHelper<T>(
            filterExprs: filterExprs,
            includeExprs: includeExprs,
            orderBy: orderBy,
            orderByDesc: orderByDesc,
            project: null, // no projection
            maxResults: maxResults);
    }
}