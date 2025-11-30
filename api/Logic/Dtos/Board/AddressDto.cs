namespace Logic.Dtos.Board;

public class AddressDto
{
    public string Name { get; set; }
    
    public string AddressLine1 { get; set; }
    
    public string AddressLine2 { get; set; }
    
    public string City { get; set; }

    public string State { get; set; }
        
    public int? ZipCode { get; set; }
        
    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }
    public string Country { get; set; }
}