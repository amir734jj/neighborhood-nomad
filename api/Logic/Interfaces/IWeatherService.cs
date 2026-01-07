using System;
using System.Threading.Tasks;
using Logic.Dtos.Weather;

namespace Logic.Interfaces;

public interface IWeatherService
{
    Task<WeatherResult> Query(float latitude, float longitude, DateTimeOffset date);
}