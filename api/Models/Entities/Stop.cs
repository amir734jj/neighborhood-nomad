using System.ComponentModel.DataAnnotations.Schema;
using Models.Interfaces;
using Newtonsoft.Json;

namespace Models.Entities
{
    [Table(nameof(Stop))]
    public class Stop : IEntity
    {
        public int Id { get; set; }
        
        [JsonIgnore]
        public int Number { get; set; }
        
        public string Description { get; set; }
        
        public int? AddressId { get; set; }
        public Address? Address { get; set; }
        
        public int? JourneyId { get; set; }
        public Journey? Journey { get; set; }
    }
}