using System.Collections.Generic;
using System.Threading.Tasks;
using Models.Entities;

namespace Logic.Interfaces;

public interface IBoardService
{
    public Task Submit(Journey dto);
    
    public Task<List<Journey>> GetJourneys(List<string> keywords);
    
    public Task Confirm(int journeyId, string email);
}