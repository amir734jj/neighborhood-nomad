using Logic.Dtos.Board;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[AllowAnonymous]
[Route("api/[controller]")]
public class BoardController(IBoardService boardService) : Controller
{
    [HttpGet]
    [Route("")]
    public virtual async Task<IActionResult> GetAll([FromQuery]List<string> filters)
    {
        return Ok(await boardService.GetJourneys(filters));
    }
    
    [HttpPost]
    [Route("")]
    public virtual async Task<IActionResult> Submit([FromBody] JourneyDto journey)
    {
        await boardService.Submit(journey);
        
        return Ok();
    }
    
    [HttpGet]
    [Route("confirm")]
    public virtual async Task<IActionResult> Confirm([FromQuery] int journeyId, [FromQuery] string email)
    {
        await boardService.Confirm(journeyId, email);
        
        return Ok();
    }
}