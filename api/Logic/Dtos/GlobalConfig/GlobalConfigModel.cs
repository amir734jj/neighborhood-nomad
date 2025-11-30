using System;
using System.Linq;
using System.Reflection;
using Logic.Attributes;
using Microsoft.Extensions.Hosting;

namespace Logic.Dtos.GlobalConfig;

public class GlobalConfigModel(IHostEnvironment hostEnvironment)
{
    [GlobalConfigCol(Name = "GEOCODI_API_KEY")]
    public string GeocodioApiKey { get; set; }

    [GlobalConfigCol(Name = "GOOGLE_MAPS_API_KEY", Public = true)]
    public string GoogleMapsAutoComplete { get; set; }
    
    [GlobalConfigCol(Name = "MAIL_JET_KEY")]
    public string MailjetApiKey { get; set; }

    [GlobalConfigCol(Name = "MAIL_JET_SECRET")]
    public string MailjetApiSecret { get; set; }

    [GlobalConfigCol(Name = "WEBSITE_ADMIN_EMAIL")]
    public string WebsiteAdminEmail { get; set; }

    [GlobalConfigCol(Name = "WEBSITE_ADDRESS")]
    public Uri WebsiteAddress { get; set; }

    [GlobalConfigCol(Name = "BUILD_DATE", Public = true, ReadOnly = true)]
    public string BuildDate => GetAssemblyBuild();

    [GlobalConfigCol(Name = "REGISTRATION_ENABLED", Public = true, ReadOnly = true)]
    public bool RegistrationEnabled => !hostEnvironment.IsProduction();

    private static string GetAssemblyBuild()
    {
        var buildDate = Assembly
            .GetExecutingAssembly()
            .GetCustomAttributes<AssemblyMetadataAttribute>()
            .Where(a => a.Key == "BuildDate")
            .Select(a => a.Value)
            .FirstOrDefault();

        return buildDate ?? DateTimeOffset.UtcNow.ToString("o");
    }
}
