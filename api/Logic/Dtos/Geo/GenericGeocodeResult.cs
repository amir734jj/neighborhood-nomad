namespace Logic.Dtos.Geo;

public class GenericGeocodeResult
{
    public AddressComponents AddressComponents { get; set; }
    public string Address { get; set; }
    public Point Point { get; set; }
    public decimal AccuracyScore { get; set; }
}