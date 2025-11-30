using System;
using System.Threading.Tasks;
using Logic.Dtos.User;
using Models.Entities;

namespace Logic.Interfaces;

public interface IUserService: IBasicCrudLogic<User>, IBasicCrudLogicInternal<User>
{
    Task PasswordResetRequest(User user, string token);
    
    Task PasswordResetSubmit(User user);
    
    Task UpdateUserLastLoginDate(User user, DateTimeOffset date);
    
    Task<User?> GetUserByEmailUsername(string email, string username);

    Task EnableOrDisableUser(EnableUserRequest enableUserRequest);
    
    Task DeleteUser(DeleteUserRequest deleteUserRequest);
}