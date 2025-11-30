using EfCoreRepository;
using Microsoft.EntityFrameworkCore;
using Models.Entities;

namespace Data.Profiles;

public class StopProfile : EntityProfile<Stop>
{
    public StopProfile()
    {
        Map(x => x.Number);
        Map(x => x.Description);
    }

    protected override IQueryable<Stop> Include<TQueryable>(TQueryable queryable)
    {
        return queryable.Include(x => x.Address);
    }
}