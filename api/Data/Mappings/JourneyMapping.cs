using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Models.Entities;

namespace Data.Mappings;

public class JourneyMapping : IEntityTypeConfiguration<Journey>
{
    public void Configure(EntityTypeBuilder<Journey> entity)
    {
        entity.HasMany(x => x.Stops)
            .WithOne(x => x.Journey)
            .HasForeignKey(x => x.JourneyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}