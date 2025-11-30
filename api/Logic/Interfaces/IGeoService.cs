using System.Collections.Generic;
using System.Threading.Tasks;
using Logic.Dtos.Geo;

namespace Logic.Interfaces;

public interface IGeoService
{
    Task<IEnumerable<GenericGeocodeResult>> MapLocation(string address, string? state = null);
}