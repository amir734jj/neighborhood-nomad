using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Data.Utilities;
using Logic.Dtos.Weather;
using Logic.Interfaces;
using Logic.Utility;
using Microsoft.AspNetCore.WebUtilities;
using OpenMeteo;

namespace Logic.Services;

public class WeatherService(IPersistentCacheService persistentCacheService, IGlobalConfigService globalConfigService) : IWeatherService
{
    public async Task<WeatherResult> Query(float latitude, float longitude, DateTimeOffset date)
    {
        var cacheKey = StringUtilities.ToMemoryCacheKey<WeatherResult>(
            latitude.ToString(CultureInfo.InvariantCulture),
            longitude.ToString(CultureInfo.InvariantCulture),
            date.ToString("yyyy-MM-dd"));

        var cachedResult = await persistentCacheService.TryGet<WeatherResult>(cacheKey);

        if (cachedResult.Success)
        {
            return cachedResult.Value!;
        }

        var timeZoneInfo = TimeZoneFromCoordinates.GetTimeZoneInfo(latitude, longitude);
        var localTime = TimeZoneInfo.ConvertTime(date, timeZoneInfo);
        
        // Try OpenMeteo first
        WeatherResult? result = null;
        
        // Try OpenMetro first
        var client = new OpenMeteoClient();

        var data = await client.QueryAsync(new WeatherForecastOptions
        {
            Latitude = latitude,
            Longitude = longitude,
            Start_date = localTime.ToString("yyyy-MM-dd"),
            End_date = localTime.ToString("yyyy-MM-dd"),
            Daily = DailyOptions.All,
            Timezone = timeZoneInfo.Id,
            Current = CurrentOptions.All,
            Temperature_Unit = TemperatureUnitType.fahrenheit,
            Windspeed_Unit = WindspeedUnitType.mph
        });

        if (data?.Current != null)
        {
            var weatherCode = (int)data!.Current!.Weathercode!;

            result = new WeatherResult
            {
                WeatherCode = weatherCode,
                Description = GetWeatherDescription(weatherCode),
                Icon = GetWeatherIcon(weatherCode),
                Temperature = data.Current.Temperature
            };
        }
        
        // If OpenMeteo fails, fall back to NOAA
        if (result == null)
        {
            var noaaData = await GetWeatherByCoords(latitude, longitude, localTime);
            
            if (noaaData != null)
            {
                result = ParseNoaaDataToWeatherResult(noaaData);
            }
        }

        if (result is null)
        {
            throw new ArgumentException("Failed to fetch weather data");
        }

        await persistentCacheService.CreateOrUpdate(cacheKey, result, TimeSpan.MaxValue);

        return result;
    }

    private static string GetWeatherDescription(int code) => code switch
    {
        0 => "Clear sky",
        1 => "Mainly clear",
        2 => "Partly cloudy",
        3 => "Overcast",
        45 or 48 => "Foggy",
        51 or 53 or 55 => "Drizzle",
        61 or 63 or 65 => "Rain",
        71 or 73 or 75 or 77 => "Snow",
        80 or 81 or 82 => "Rain showers",
        85 or 86 => "Snow showers",
        95 => "Thunderstorm",
        96 or 99 => "Thunderstorm with hail",
        _ => "Unknown"
    };

    private static string GetWeatherIcon(int code) => code switch
    {
        0 => "☀️",
        1 => "🌤️",
        2 => "⛅",
        3 => "☁️",
        45 or 48 => "🌫️",
        51 or 53 or 55 => "🌦️",
        61 or 63 or 65 => "🌧️",
        71 or 73 or 75 or 77 => "❄️",
        80 or 81 or 82 => "🌧️",
        85 or 86 => "🌨️",
        95 => "⛈️",
        96 or 99 => "⛈️",
        _ => "❓"
    };


    private async Task<string?> GetWeatherByCoords(double lat, double lon, DateTimeOffset date)
    {
        var globalConfig = await globalConfigService.GetAllGlobalConfig();
        using HttpClient client = new();
        const string baseUrl = "https://www.ncei.noaa.gov/cdo-web/api/v2";
        var dateStr = date.ToString("yyyy-MM-dd");

        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("token", globalConfig.NCEIWeatherApiKey);

        // --- STEP 1: Find stations with an expanding radius ---
        var radius = 0.1; // Start with ~7 miles
        const double maxRadius = 0.5; // Don't go further than ~35 miles

        while (radius <= maxRadius)
        {
            var stationParams = new Dictionary<string, string?>
            {
                ["extent"] = $"{lat - radius},{lon - radius},{lat + radius},{lon + radius}",
                ["datasetid"] = "GHCND",
                ["datatypeid"] = "TMAX"
            };

            var stationSearchUrl = QueryHelpers.AddQueryString($"{baseUrl}/stations", stationParams);
            var stationResponse = await client.GetStringAsync(stationSearchUrl);
            var stationDoc = JsonDocument.Parse(stationResponse);

            // If we found results, try to get data from them
            if (stationDoc.RootElement.TryGetProperty("results", out var stations))
            {
                // --- STEP 2: Priority Sorting (Official WBAN/COOP first, then distance) ---
                var stationList = stations.EnumerateArray()
                    .Select(s => new
                    {
                        Id = s.GetProperty("id").GetString()!,
                        IsOfficial = s.GetProperty("id").GetString()!.StartsWith("GHCND:USW") ||
                                     s.GetProperty("id").GetString()!.StartsWith("GHCND:USC"),
                        Distance = CalculateDistance(lat, lon, s.GetProperty("latitude").GetDouble(),
                            s.GetProperty("longitude").GetDouble())
                    })
                    .OrderByDescending(s => s.IsOfficial)
                    .ThenBy(s => s.Distance)
                    .ToList();

                // --- STEP 3: Data Retrieval with Fallback Loop ---
                foreach (var dataUrl in stationList.Select(station => new Dictionary<string, string?>
                         {
                             ["datasetid"] = "GHCND",
                             ["stationid"] = station.Id,
                             ["startdate"] = dateStr,
                             ["enddate"] = dateStr,
                             ["units"] = "standard"
                         }).Select(dataParams => QueryHelpers.AddQueryString($"{baseUrl}/data", dataParams)))
                {
                    var dataResponse = await client.GetAsync(dataUrl);
                    var content = await dataResponse.Content.ReadAsStringAsync();

                    // Check if JSON is not empty and contains the "results" array
                    if (dataResponse.IsSuccessStatusCode)
                    {
                        var jsonDocument = JsonDocument.Parse(content);
                        if (jsonDocument.RootElement.TryGetProperty("results", out var resultsArray) &&
                            resultsArray.ValueKind == JsonValueKind.Array &&
                            resultsArray.GetArrayLength() > 0)
                        {
                            return content; // Success: Return the first station that actually has data
                        }
                    }
                }
            }

            // No stations found or no data from any station, increase the search area and try again
            radius += 0.1;
        }

        return null;
    }
    
    private static WeatherResult? ParseNoaaDataToWeatherResult(string jsonData)
    {
        try
        {
            using var doc = JsonDocument.Parse(jsonData);
            if (!doc.RootElement.TryGetProperty("results", out var results)) return null;

            float? temperature = null;
            float precipitationAmount = 0;
            float snowAmount = 0;

            // Track specific conditions using NOAA WT codes
            var isThunder = false;
            var isFog = false;
            var isSleetOrHail = false;

            foreach (var item in results.EnumerateArray())
            {
                var datatype = item.GetProperty("datatype").GetString();
                var value = item.GetProperty("value").GetSingle();

                switch (datatype)
                {
                    case "TMAX":
                    {
                        temperature = value;
                        break;
                    }
                    case "PRCP":
                    {
                        precipitationAmount = value;
                        break;
                    }
                    case "SNOW":
                    {
                        snowAmount = value;
                        break;
                    }

                    // Weather Types (WT codes)
                    case "WT03":
                    {
                        isThunder = true;
                        break; // Thunder
                    }
                    case "WT01": // Fog
                    case "WT02":
                    {
                        isFog = true;
                        break; // Heavy Fog
                    }
                    case "WT04": // Sleet
                    case "WT05":
                    {
                        isSleetOrHail = true;
                        break; // Hail
                    }
                }
            }

            // --- Priority-Based Weather Code Mapping ---
            var weatherCode = 0; // Default: Clear

            if (isThunder)
            {
                weatherCode = isSleetOrHail ? 99 : 95; // 99: Thunder w/ Hail, 95: Thunderstorm
            }
            else if (snowAmount > 0)
            {
                // Snow Hierarchy
                weatherCode = snowAmount > 0.5 ? 75 : 71;
            }
            else if (isSleetOrHail)
            {
                weatherCode = 77; // Snow grains / Sleet
            }
            else if (precipitationAmount > 0)
            {
                // Rain Hierarchy
                weatherCode = precipitationAmount > 0.3 ? 65 : 61;
            }
            else if (isFog)
            {
                weatherCode = 45; // Fog
            }
            else if (temperature.HasValue && temperature > 90)
            {
                // Optional: Handle extreme clear sky
                weatherCode = 0;
            }

            return new WeatherResult
            {
                WeatherCode = weatherCode,
                Description = GetWeatherDescription(weatherCode),
                Icon = GetWeatherIcon(weatherCode),
                Temperature = temperature
            };
        }
        catch
        {
            return null;
        }
    }

    // Haversine formula to find distance between two points in miles
    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLon = (lon2 - lon1) * (Math.PI / 180);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * (Math.PI / 180)) * Math.Cos(lat2 * (Math.PI / 180)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return 3958.8 * c;
    }
}
