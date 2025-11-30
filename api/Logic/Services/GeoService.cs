using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Arex388.Geocodio;
using Data.Utilities;
using Logic.Dtos.Geo;
using Logic.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using AddressComponents = Logic.Dtos.Geo.AddressComponents;

namespace Logic.Services;

public class GeoService(IGeocodioClientFactory geoCodioFactory, IGlobalConfigService globalConfigService, IMemoryCache memoryCache) : IGeoService
{
    private async Task<IGeocodioClient> GeoCodioClient()
    {
        var globalConfig = await globalConfigService.GetAllGlobalConfig();

        return geoCodioFactory.CreateClient(new GeocodioClientOptions
        {
            Key = globalConfig.GeocodioApiKey
        });
    }
    
    public async Task<IEnumerable<GenericGeocodeResult>> MapLocation(string address, string? state = null)
    {
        if (string.IsNullOrWhiteSpace(address) || address.Length < 10)
        {
            return [];
        }

        var cacheKey = StringUtilities.ToMemoryCacheKey<GeoService>(JsonConvert.SerializeObject(new { address = address.Trim(), state }));
        Geocode.Response? result;
        
        if (memoryCache.TryGetValue<Geocode.Response>(cacheKey, out var cachedResult))
        {
            result = cachedResult;
        }
        else
        {
            var geoCodioClient = await GeoCodioClient();

            result = await geoCodioClient.GeocodeAsync(address);

            if (!result.Success)
            {
                return [];
            }

            memoryCache.Set(cacheKey, result, DateTimeOffset.UtcNow.AddHours(1));
        }

        // Interested in accurate responses, not guesses for incomplete address
        return result!.Results
            .OrderByDescending(x => x.AccuracyScore)
            .Where(x => string.IsNullOrWhiteSpace(state) || x.AddressComponents.State == state)
            .Select(x => new GenericGeocodeResult
            {
                AccuracyScore = x.AccuracyScore,
                AddressComponents = new AddressComponents
                {
                    City = x.AddressComponents.City,
                    County = x.AddressComponents.County,
                    State = x.AddressComponents.State,
                    Number = x.AddressComponents.Number,
                    PostalCode = x.AddressComponents.PostalCode,
                    Street = x.AddressComponents.Street,
                },
                Address = x.Address,
                Point = new Point()
                {
                    Longitude = x.Point?.Longitude ?? decimal.Zero,
                    Latitude = x.Point?.Latitude ?? decimal.Zero
                }
            }).ToList();
    }
}
