using System.Collections.Generic;
using System.Threading.Tasks;
using Logic.Dtos.Board;

namespace Logic.Interfaces;

public interface IBoardService
{
    public Task Submit(JourneyDto journeyDto);
    
    public Task<List<JourneyDto>> GetJourneys(List<string> keywords);
    
    public Task Confirm(int journeyId, string email);
}