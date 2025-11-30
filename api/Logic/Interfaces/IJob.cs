using System.Threading.Tasks;

namespace Logic.Interfaces;

public interface IJob
{
    public string Schedule { get; }
    
    public Task ExecuteAsync();
}