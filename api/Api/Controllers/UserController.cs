using Api.Abstracts;
using Logic.Dtos.User;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Constants;
using Models.Entities;

namespace Api.Controllers;

[Authorize(Roles = RoleNameConstants.Admin)]
[Route("api/[controller]")]
public class UserController(IUserService userService) : BasicCrudController<User>
{
    protected override IBasicCrudLogic<User> BasicCrudLogic()
    {
        return userService;
    }

    [HttpPost]
    [Route("EnableOrDisableUser")]
    public async Task<IActionResult> EnableOrDisableUser([FromBody]EnableUserRequest enableUserRequest)
    {
        await userService.EnableOrDisableUser(enableUserRequest);
        
        return Ok("Successfully updated");
    }

    [HttpPost]
    [Route("DeleteUser")]
    public async Task<IActionResult> DeleteUser([FromBody]DeleteUserRequest deleteUserRequest)
    {
        await userService.DeleteUser(deleteUserRequest);
        
        return Ok("Successfully deleted");
    }
}