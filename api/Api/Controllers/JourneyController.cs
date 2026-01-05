using Api.Abstracts;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Entities;

namespace Api.Controllers;

[Authorize]
[Route("api/[controller]")]
public class JourneyController(IJourneyService journeyService) : BasicCrudController<Journey>
{
    protected override IBasicCrudLogic<Journey> BasicCrudLogic()
    {
        return journeyService;
    }

    [AllowAnonymous]
    [HttpGet]
    [Route("{id:int}")]
    public override Task<IActionResult> Get(int id)
    {
        return base.Get(id);
    }
}