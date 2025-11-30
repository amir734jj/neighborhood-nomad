using Api.Abstracts;
using Logic.Dtos.Email;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class EmailController(IEmailService emailService, ILogger<EmailController> logger) : IdentityController
{
    [HttpGet]
    [Route("Sender/Status")]
    public virtual async Task<IActionResult> IsSenderRegistered([FromQuery] string? email = null)
    {
        var user = await GetCurrentUser();
        email ??= user!.Email!;
        
        return Ok(await emailService.IsSenderRegistered(email));
    }

    [HttpPost]
    [Route("Sender")]
    public virtual async Task<IActionResult> RegisterSender([FromQuery] string? email = null)
    {
        var user = await GetCurrentUser();
        email ??= user!.Email!;
        
        var result = await emailService.RegisterSender(email);
        return Ok(result);
    }

    [HttpDelete]
    [Route("Sender")]
    public virtual async Task<IActionResult> UnRegisterSender([FromQuery] string? email = null)
    {
        var user = await GetCurrentUser();
        email ??= user!.Email!;
        
        var result = await emailService.UnRegisterSender(email);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("Callback")]
    public virtual async Task<IActionResult> Callback([FromBody] JToken body)
    {
        logger.LogInformation("Email callback Body={Body}", JsonConvert.SerializeObject(body));

        switch (body)
        {
            case JObject singleMailEvent:
                await emailService.Callback([singleMailEvent.ToObject<MailjetEvent>()!]);
                break;
            case JArray arrayMailEvent:
                await emailService.Callback(arrayMailEvent.ToObject<MailjetEvent[]>()!);
                break;
        }
        
        return Ok("Replied to callback");
    }
}
