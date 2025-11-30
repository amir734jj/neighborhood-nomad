using System.Threading.Tasks;
using Logic.Dtos.Profile;
using Models.Entities;

namespace Logic.Interfaces;

public interface IProfileService
{
    Task<ProfileViewModel> ResolveProfile(User user);

    Task<ProfileViewModel> UpdateUser(User user, ProfileViewModel profile);
}