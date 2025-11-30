using EfCoreRepository;
using Models.Entities;

namespace Data.Profiles;

public class UserProfile : EntityProfile<User>
{
    public UserProfile()
    {
        Map(user => user.Enabled);
        Map(user => user.LastLoginDate);
        Map(user => user.Name);
    }
}