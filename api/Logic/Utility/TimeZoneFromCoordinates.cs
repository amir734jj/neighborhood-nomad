using System;
using GeoTimeZone;
using TimeZoneConverter;

namespace Logic.Utility;

public static class TimeZoneFromCoordinates
{
    /// <summary>
    /// Returns a platform-friendly TimeZoneInfo for a latitude/longitude.
    /// </summary>
    public static TimeZoneInfo GetTimeZoneInfo(double latitude, double longitude)
    {
        // 1) Lookup IANA zone from coordinates (e.g., "America/Chicago")
        var iana = TimeZoneLookup.GetTimeZone(latitude, longitude).Result;

        // 2) Convert to TimeZoneInfo in a platform-neutral way
        //    (handles Windows vs Linux/macOS differences)
        return TZConvert.GetTimeZoneInfo(iana);
    }
}
