namespace Logic.Dtos.Weather;

public class WeatherResult
{
    public int WeatherCode { get; set; }
    public string Description { get; set; }
    public string Icon { get; set; }
    public float? Temperature { get; set; }
}