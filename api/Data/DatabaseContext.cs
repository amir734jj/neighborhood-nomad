using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Entities;

namespace Data;

public sealed class DatabaseContext(DbContextOptions<DatabaseContext> options)
    : IdentityDbContext<User, Role, Guid>(options)
{
    public DbSet<Address> Addresses { get; set; }
    
    public DbSet<Stop> Stops { get; set; }
    
    public DbSet<Journey> Journeys { get; set; }
    
    public DbSet<GlobalConfig> GlobalConfig  { get; set; }
    
    public DbSet<PersistentCacheItem> PersistentCacheItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("nomad");

        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DatabaseContext).Assembly);
    }
}