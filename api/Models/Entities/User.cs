using System;
using Microsoft.AspNetCore.Identity;
using Models.Interfaces;

namespace Models.Entities
{
    public class User : IdentityUser<Guid>, IEntity
    {
        public string? Name { get; set; }
        
        public bool Enabled { get; set; }
        public DateTimeOffset? LastLoginDate { get; set; }
    }
}