using System.ComponentModel.DataAnnotations.Schema;
using Models.Interfaces;

namespace Models.Entities
{
    [Table(nameof(Address))]
    public class Address : IEntity
    {
        public int Id  { get; set; }
        
        public string Name { get; set; }
        
        public string? AddressLine1 { get; set; }
        
        public string? AddressLine2 { get; set; }
        
        public string? City { get; set; }
        
        public string? State { get; set; }
        
        public string? Country { get; set; }
        
        public int? ZipCode { get; set; }
        
        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }
        
        public Stop? StopRef { get; set; }
    }
}

