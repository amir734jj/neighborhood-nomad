using System.Threading.Tasks;
using Logic.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Models.Entities;

namespace Logic.Extensions;

public static class HttpContextExtension
{
    public static async Task<User?> GetUser(this HttpContext? httpContext)
    {
        if (httpContext == null)
        {
            return null;
        }

        var userManager = httpContext.RequestServices.GetRequiredService<UserManager<User>>()!;
        var userService = httpContext.RequestServices.GetRequiredService<IUserService>();

        if (httpContext.User.Identity is { IsAuthenticated: false })
        {
            return null;
        }

        var user = await userManager.FindByNameAsync(httpContext.User.Identity!.Name!);

        return user != null ? await userService.Get(user.Id) : null;
    }
}