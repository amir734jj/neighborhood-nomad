using System;
using System.Collections.Generic;

namespace Logic.Dtos.Board;

public class JourneyDto
{
    public string Description { get; set; }
    
    public List<StopDto> Stops { get; set; }
    public DateTimeOffset Date { get; set; }
    public string Email { get; set; }
    public string[] Photos { get; set; }
}