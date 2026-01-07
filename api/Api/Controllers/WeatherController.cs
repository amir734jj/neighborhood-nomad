using Logic.Interfaces;
using Logic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[AllowAnonymous]
[Route("api/[controller]")]
public class WeatherController(IWeatherService weatherService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> GetWeather([FromQuery] float longitude, [FromQuery] float latitude, [FromQuery] DateTimeOffset date)
    {
        var result = await weatherService.Query(latitude, longitude, date);
        return Ok(result);
    }
}
