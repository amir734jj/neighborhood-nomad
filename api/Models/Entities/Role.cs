using System;
using Microsoft.AspNetCore.Identity;
using Models.Interfaces;

namespace Models.Entities;

public class Role : IdentityRole<Guid>, IEntity
{
    public Role(string roleName) : base(roleName)
    {
    }
    
    // ReSharper disable once UnusedMember.Global
    public Role()
    {
    }
}