using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Models.Interfaces;

namespace Models.Entities
{
    [Table(nameof(Journey))]
    public class Journey : IEntity
    {
        public Guid Id { get; set; }
        
        public DateTimeOffset Date { get; set; }
        
        public DateTimeOffset SubmissionDate { get; set; }
        
        public string Email { get; set; }
        
        public bool Verified { get; set; }
        
        public ICollection<Stop> Stops { get; set; }
        
        public string Description { get; set; }
        
        // Derived property
        [NotMapped]
        public string SingleLineDescription => Description.Split(Environment.NewLine).FirstOrDefault() ?? string.Empty;
 
        // Derived property
        [NotMapped]
        public string MoreDescription => string.Join(Environment.NewLine, Description.Split(Environment.NewLine).Skip(1));

        public string[] Photos { get; set; }
    }
}