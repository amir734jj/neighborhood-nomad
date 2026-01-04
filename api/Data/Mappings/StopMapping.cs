using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Models.Entities;

namespace Data.Mappings;

public class StopMapping : IEntityTypeConfiguration<Stop>
{
    public void Configure(EntityTypeBuilder<Stop> entity)
    {
        entity.HasOne(x => x.Address)
            .WithOne(x => x.StopRef)
            .HasForeignKey<Stop>(x => x.AddressId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}