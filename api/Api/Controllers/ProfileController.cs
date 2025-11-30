using Api.Abstracts;
using Logic.Dtos.Profile;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class ProfileController(IProfileService profileLogic)
    : IdentityController
{
    [HttpGet]
    [Route("")]
    public async Task<IActionResult> Index()
    {
        var user = await GetCurrentUser();
        
        return Ok(await profileLogic.ResolveProfile(user!));
    }

    [HttpPost]
    [Route("")]
    public async Task<IActionResult> Update([FromBody] ProfileViewModel profileViewModel)
    {
        var user = await GetCurrentUser();

        return Ok(await profileLogic.UpdateUser(user!, profileViewModel));
    }
}