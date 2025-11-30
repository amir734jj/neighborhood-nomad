using EfCoreRepository;
using Microsoft.EntityFrameworkCore;
using Models.Entities;

namespace Data.Profiles;

public class JourneyProfile : EntityProfile<Journey>
{
    public JourneyProfile()
    {
        Map(x => x.Date);
        Map(x => x.SubmissionDate);
        Map(x => x.Email);
        Map(x => x.Verified);
        Map(x => x.Description);
    }

    protected override IQueryable<Journey> Include<TQueryable>(TQueryable queryable)
    {
        return queryable
            .Include(x => x.Stops.OrderBy(y => y.Number))
            .ThenInclude(x => x.Address);
    }
}