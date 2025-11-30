using System.Threading.Tasks;
using Logic.Dtos.Profile;
using Logic.Interfaces;
using Microsoft.AspNetCore.Identity;
using Models.Entities;

namespace Logic.Services;

public class ProfileService(UserManager<User> userManager, IUserService userService) : IProfileService
{
    public async Task<ProfileViewModel> ResolveProfile(User user)
    {
        var roles = await userManager.GetRolesAsync(user);

        return new ProfileViewModel
        {
            Name =  user.Name,
            UserId = user.Id,
            Username =  user.UserName,
            Email = user.Email!,
            Role = string.Join(',', roles),
        };
    }

    public async Task<ProfileViewModel> UpdateUser(User user, ProfileViewModel profile)
    {
        await userService.Update(user.Id, x =>
        {
            x.Name = profile.Name;
        });

        return await ResolveProfile(user);
    }
}
