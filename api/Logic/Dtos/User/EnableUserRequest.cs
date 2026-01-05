using System;

namespace Logic.Dtos.User;

public class EnableUserRequest
{
    public Guid UserId { get; set; }
    
    public bool Enabled { get; set; }
}