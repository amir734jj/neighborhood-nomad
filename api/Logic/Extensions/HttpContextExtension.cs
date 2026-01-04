using System.Threading.Tasks;
using Logic.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Models.Entities;

namespace Logic.Extensions;

public static class HttpContextExtension
{
    extension(HttpContext? httpContext)
    {
        public async Task<User?> GetUser()
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

        public async Task<Role?> GetRole()
        {
            if (httpContext == null)
            {
                return null;
            }

            var user = await httpContext.GetUser();
            
            if (user == null)
            {
                return null;
            }

            var roleManager = httpContext.RequestServices.GetRequiredService<RoleManager<Role>>()!;
            var userManager = httpContext.RequestServices.GetRequiredService<UserManager<User>>()!;

            var roles = await userManager.GetRolesAsync(user);
            
            if (roles.Count == 0)
            {
                return null;
            }

            var role = await roleManager.FindByNameAsync(roles[0]);

            return role;
        }
    }
}
