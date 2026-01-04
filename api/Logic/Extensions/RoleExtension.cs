using Models.Constants;
using Models.Entities;

namespace Logic.Extensions;

public static class RoleExtension
{
    extension(Role role)
    {
        public bool IsAdminRole()
        {
            return role.Name!.Equals(RoleNameConstants.Admin);
        }

        public bool IsUserRole()
        {
            return role.Name!.Equals(RoleNameConstants.User);
        }
    }
}