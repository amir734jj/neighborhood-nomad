namespace Data.Utilities;

public static class EnvironmentUtility
{
    public static bool IsProd => Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
}