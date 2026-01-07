using EfCoreRepository;
using Models.Entities;

namespace Data.Profiles;

public class PersistentCacheItemEntity : EntityProfile<PersistentCacheItem>
{
    public PersistentCacheItemEntity()
    {
        MapAll();
    }
}