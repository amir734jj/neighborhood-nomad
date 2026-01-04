using System;
using Models.Entities;

namespace Logic.Extensions;

public static class UserExtension
{
    extension(User user)
    {
        public bool HasSameEmail(string email)
        {
            return user.Email!.Equals(email, StringComparison.InvariantCultureIgnoreCase);
        }

        public bool HasSameUserName(string userName)
        {
            return user.UserName!.Equals(userName, StringComparison.InvariantCultureIgnoreCase);
        }
    }
}