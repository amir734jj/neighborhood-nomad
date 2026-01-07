using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Models.Entities;

namespace Data.Mappings;

public class PersistentCacheItemMapping : IEntityTypeConfiguration<PersistentCacheItem>
{
    public void Configure(EntityTypeBuilder<PersistentCacheItem> entity)
    {
        entity
            .Property(p => p.Expires)
            .HasConversion<long>(); 
    }
}