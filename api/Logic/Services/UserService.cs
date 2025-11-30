using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EfCoreRepository.Interfaces;
using Logic.Abstracts;
using Logic.Dtos.User;
using Logic.Interfaces;
using Logic.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Models.Entities;

namespace Logic.Services;

public class UserService(
    IEfRepository repository,
    IEmailService emailService,
    UserManager<User> userManager,
    IGlobalConfigService globalConfigService,
    ILogger<UserService> logger) : BasicCrudLogicAbstract<User>, IUserService
{
    protected override IBasicCrud<User> Repository()
    {
        return repository.For<User>().SplitQuery();
    }

    public async Task PasswordResetRequest(User user, string token)
    {
        var globalConfig = await globalConfigService.GetAllGlobalConfig();

        var queryParams = new Dictionary<string, string>
        {
            { "token",token },
            { "email", user.Email! },
            { "username", user.UserName! }
        };

        var uriBuilder = new UriBuilder(globalConfig.WebsiteAddress)
        {
            Path = "Forgot-Password/Submit",
            Query = string.Join("&", queryParams
                .Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"))
        };

        var message = new StringBuilder()
            .Append("Hi")
            .AppendLine(user.UserName)
            .AppendLine("You requested to reset your password (expires in 24 hours).")
            .Append("URL: ")
            .AppendLine(uriBuilder.Uri.AbsoluteUri)
            .AppendLine()
            .AppendLine("Regards")
            .ToString();

        await emailService.SendEmailAsync(globalConfig.WebsiteAdminEmail!, "Password Reset Request", message, [user?.Email!]);
    }

    public async Task PasswordResetSubmit(User user)
    {
        var globalConfig = await globalConfigService.GetAllGlobalConfig();

        var message = new StringBuilder()
            .Append("Hi")
            .AppendLine(user.UserName)
            .AppendLine("You password was successfully reset.")
            .AppendLine()
            .AppendLine("Regards")
            .ToString();
        
        await emailService.SendEmailAsync(globalConfig.WebsiteAdminEmail, "Password Reset Notification", message, [user.Email!]);
    }

    public async Task UpdateUserLastLoginDate(User user, DateTimeOffset date)
    {
        await Update(user.Id, x =>
        {
            x.LastLoginDate = date;
        });
    }

    public async Task<User?> GetUserByEmailUsername(string email, string username)
    {
        return (await this.GetAllHelper(filterExprs:
        [
            x => x.Email!.ToLower() == email.ToLower(),
            x => x.UserName!.ToLower() == username.ToLower()
        ])).FirstOrDefault();
    }

    public async Task EnableOrDisableUser(EnableUserRequest enableUserRequest)
    {
        await Update(enableUserRequest.UserId, x =>
        {
            x.Enabled = enableUserRequest.Enabled;
        });

        var user = await userManager.FindByIdAsync(enableUserRequest.UserId.ToString());
        
        if (!enableUserRequest.Enabled)
        {
            // Forces user to sign out
            await userManager.UpdateSecurityStampAsync(user!);
        }
    }

    public async Task DeleteUser(DeleteUserRequest deleteUserRequest)
    {
        var user = await userManager.FindByIdAsync(deleteUserRequest.UserId.ToString());
        
        // Forces user to sign out
        await userManager.UpdateSecurityStampAsync(user!);

        var roles = await userManager.GetRolesAsync(user!);
        await userManager.RemoveFromRolesAsync(user!, roles.ToArray());

        try
        {
            await userManager.DeleteAsync(user!);
        }
        catch (Exception e)
        {
            logger.LogError("Failed to delete user {User} via UserManager with exception={Exception}, will try hard-deleting user", user!.UserName, e);
            
            // hard delete
            await Delete(user!.Id);
        }
    }
}