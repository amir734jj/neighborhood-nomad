using System.Collections.Generic;

namespace Logic.Dtos.User;

public class UserViewModel : Models.Entities.User
{
    public IList<string> Roles { get; set; }
}