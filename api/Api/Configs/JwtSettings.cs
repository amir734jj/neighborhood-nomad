namespace Api.Configs;

public class JwtSettings
{
    public required string Key { get; set; }

    public required string Issuer { get; init; }

    public required string Audience { get; init; }

    public required int AccessTokenDurationInMinutes { get; init; }
}