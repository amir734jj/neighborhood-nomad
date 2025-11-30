using Logic.Extensions;
using Microsoft.AspNetCore.Mvc;
using Models.Entities;

namespace Api.Abstracts;

public class IdentityController : ControllerBase
{
    [NonAction]
    protected async Task<User?> GetCurrentUser()
    {
        return await HttpContext.GetUser();
    }
}