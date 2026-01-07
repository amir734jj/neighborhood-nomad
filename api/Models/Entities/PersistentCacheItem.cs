using System;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Interfaces;

namespace Models.Entities;

[Table(nameof(PersistentCacheItem))]
public class PersistentCacheItem : IEntity
{
    public Guid Id { get; set; }
    
    public string Key { get; set; }
    
    [Column(TypeName = "jsonb")]
    public string Value { get; set; }
    
    public DateTimeOffset CreatedTime { get; set; }
    
    public DateTimeOffset AccessTime { get; set; }
    
    public TimeSpan Expires { get; set; }
}