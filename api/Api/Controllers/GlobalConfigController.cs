using Logic.Dtos.GlobalConfig;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class GlobalConfigController(IGlobalConfigService globalConfigService) : ControllerBase
{
    [HttpGet]
    [Route("")]
    public virtual async Task<IActionResult> Get()
    {
        return Ok(await globalConfigService.GetAllGlobalConfig());
    }
    
    [AllowAnonymous]
    [HttpGet]
    [Route("Public")]
    public virtual async Task<IActionResult> GetPublic()
    {
        return Ok(await globalConfigService.GetPublicGlobalConfig());
    }

    [HttpPost]
    [Route("")]
    public virtual async Task<IActionResult> Update([FromBody] GlobalConfigModel globalConfig)
    {
        await globalConfigService.UpdateGlobalConfig(globalConfig);
        
        return Ok("Successfully updated");
    }
}