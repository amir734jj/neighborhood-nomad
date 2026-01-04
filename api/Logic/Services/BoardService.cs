using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using FuzzySharp;
using Logic.Dtos.Email;
using Logic.Interfaces;
using Models.Entities;
using Logic.Extensions;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Logic.Services;

public class BoardService(
    IGeoService geoService,
    IGlobalConfigService globalConfigService,
    IJourneyService journeyService,
    IStopService stopService,
    IAddressService addressService,
    IEmailService emailService,
    ILogger<BoardService> logger) : IBoardService
{
    public async Task Submit(Journey journeyDto)
    {
        var journey = await journeyService.Save(new Journey
        {
            Description = journeyDto.Description,
            Date = journeyDto.Date,
            SubmissionDate = DateTimeOffset.Now,
            Verified = false,
            Email = journeyDto.Email,
            Photos = journeyDto.Photos
        });
        
        foreach (var journeyDtoStop in journeyDto.Stops.Where(x => string.IsNullOrEmpty(x.Address!.AddressLine1)))
        {
            var line = journeyDtoStop.Address.GetAddressSingleLine(includeCountry: true);
            
            var result = (await geoService.MapLocation(line)).FirstOrDefault();
            
            // assign longitude and latitude if accuracy score is 100%
            if (result is { AccuracyScore: 1 })
            {
                journeyDtoStop.Address!.AddressLine1 = result.Address;
                journeyDtoStop.Address.City = result.AddressComponents.City;
                journeyDtoStop.Address.ZipCode = int.TryParse(result.AddressComponents.PostalCode, out var zipCode) ? zipCode : null;
                journeyDtoStop.Address.State = result.AddressComponents.State;
                journeyDtoStop.Address.Country = result.AddressComponents.County;
                journeyDtoStop.Address.Longitude = result.Point.Longitude;
                journeyDtoStop.Address.Latitude = result.Point.Latitude;
            }
            else
            {
                logger.LogInformation("Skipping {Address} since it has accuracy score of {Score}", line, result?.AccuracyScore);
            }
        }
        
        var addresses = (await addressService.SaveMany(journeyDto.Stops.Select(x => new Address
        {
            Name = x.Address!.Name,
            AddressLine1 = x.Address.AddressLine1,
            AddressLine2 = x.Address.AddressLine2,
            Country = x.Address.Country,
            City = x.Address.City,
            State = x.Address.State,
            ZipCode = x.Address.ZipCode,
            Latitude = x.Address.Latitude,
            Longitude = x.Address.Longitude
        }).ToArray())).ToList();

        await stopService.SaveMany(journeyDto.Stops.Select((x, index) => new Stop
        {
            Description = x.Description,
            AddressId = addresses[index].Id,
            JourneyId = journey.Id,
            Number = index
        }).ToArray());

        var globalConfig = await globalConfigService.GetAllGlobalConfig();
        
        var queryString = HttpUtility.ParseQueryString(string.Empty);

        queryString.Add("id", journey.Id.ToString());
        queryString.Add("email", journey.Email);

        await emailService.SendEmailAsync(
            globalConfig.WebsiteAdminEmail,
            "Journey Submitted - Confirmation",
            $"""
                     Please confirm your submission.
                     {new UriBuilder(globalConfig.WebsiteAdminEmail) { Path = "/board/confirm", Query = queryString.ToString() }}
             """,
            [journey.Email],
            payload: new EmailEventPayload
            {
                JourneyId = journey.Id,
            });
    }

    public async Task<List<Journey>> GetJourneys(List<string> keywords)
    {
        if (keywords.Count == 0)
        {
            return (await journeyService.GetAllHelper(filterExprs: [x => x.Verified], orderByDesc: x => x.Id, maxResults: 20)).ToList();
        }
        
        var journeys = await journeyService.GetAllHelper(filterExprs: [x => x.Verified]);

        return FuzzySearch(journeys, keywords).ToList();
    }

    public async Task Confirm(int journeyId, string email)
    {
        var journey = (await journeyService.GetAllHelper(filterExprs:[x => x.Id == journeyId, x => !x.Verified])).FirstOrDefault();

        if (journey != null)
        {
            await journeyService.Update(journeyId, x =>
            {
                x.Verified = true;
            });
        }
    }
    
    private static int ComputeScore(Journey journey, List<string> keywords)
    {
        var text = string.Join(' ', new[]
        {
            journey.Description,
            journey.Email,
        }.Concat(journey.Stops.SelectMany(x => new[]
        {
            x.Description, x.Address?.Name, x.Address?.AddressLine1, x.Address?.City, x.Address?.State
        })));

        // Use PartialRatio to find substring matches (e.g., "parent" matches "parents")
        // and TokenSetRatio for tokenized matches, then take the maximum
        return keywords.Select(keyword =>
        {
            var val1 = Fuzz.TokenInitialismRatio(text.ToLower(), keyword.ToLower());
            var val2 = Fuzz.TokenSetRatio(text.ToLower(), keyword.ToLower());
            var val3 = Fuzz.WeightedRatio(text.ToLower(), keyword.ToLower());
            var val4 = Fuzz.Ratio(text.ToLower(), keyword.ToLower());
            
            return new [] {val1, val2, val3, val4}.Max();
        }).Prepend(0).Max();
    }

    private static IEnumerable<Journey> FuzzySearch(IEnumerable<Journey> journeys, List<string> keywords, int minScore = 50)
    {
        return journeys
            .Select(p => new
            {
                Item = p,
                Score = ComputeScore(p, keywords)
            })
            .Where(x => x.Score >= minScore)
            .OrderByDescending(x => x.Score)
            .Select(x => x.Item);
    }
}