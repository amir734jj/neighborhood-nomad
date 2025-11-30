using System.Threading.Tasks;
using Logic.Interfaces;

namespace Logic.Abstracts;

public abstract class JobBaseAbstract(string schedule) : IJob
{
    public string Schedule => schedule;

    public abstract Task ExecuteAsync();
}