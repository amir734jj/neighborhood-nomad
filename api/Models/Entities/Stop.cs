using System;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Interfaces;

namespace Models.Entities
{
    [Table(nameof(Stop))]
    public class Stop : IEntity
    {
        public Guid Id { get; set; }
        
        public int Number { get; set; }
        
        public string Description { get; set; }
        
        public Guid? AddressId { get; set; }
        public Address? Address { get; set; }
        
        public Guid? JourneyId { get; set; }
        public Journey? Journey { get; set; }
    }
}