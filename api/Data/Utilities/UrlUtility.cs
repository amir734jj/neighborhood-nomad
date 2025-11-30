using System.Collections.Immutable;
using System.Net;

namespace Data.Utilities;

public static class UrlUtility
{
    // Converts connection string url to resource
    public static IReadOnlyDictionary<string, string> UrlToResource(string connectionStringUrl)
    {
        var isUrl = Uri.TryCreate(connectionStringUrl, UriKind.Absolute, out var url);

        if (!isUrl) return ImmutableDictionary.Create<string, string>();

        var connectionStringBuilder = new Dictionary<string, string>
        {
            ["Port"] = url!.Port.ToString(),
            ["Host"] = url.Host,
            ["Username"] = url.UserInfo!.Split(':').GetValue(0)?.ToString()!,
            ["Password"] = url.UserInfo.Split(':').GetValue(1)?.ToString()!,
            ["Database"] = url.LocalPath[1..],
            ["ApplicationName"] = "asphalt-admin"
        };

        return connectionStringBuilder;
    }
    
    public static string ToQueryString(Dictionary<string, string>? parameters)
    {
        if (parameters == null || parameters.Count == 0)
        {
            return string.Empty;
        }

        return string.Join('&', parameters
            .Select(kvp => $"{WebUtility.UrlEncode(kvp.Key)}={WebUtility.UrlEncode(kvp.Value.ToString())}"));
    }
}