using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Models.Interfaces;

namespace Models.Entities
{
    [Table(nameof(GlobalConfig))]
    public class GlobalConfig : IEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
    
        public string Key { get; set; }
    
        public string Value { get; set; }
    }
}