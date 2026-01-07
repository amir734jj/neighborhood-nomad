using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Logic.Abstracts;
using Logic.Interfaces;
using Logic.Services;
using Models.Entities;

namespace Logic.BackgroundTask;

public class CleanupPhotos(IJourneyService journeyService, ISpaceService spaceService) : JobBaseAbstract(Cron.Daily())
{
    public override async Task ExecuteAsync()
    {
        var journeys = await journeyService.GetAllHelper(
            project: x => new Journey { Photos = x.Photos },
            filterExprs: [x => x.Photos.Any()]);

        var referencedFiles = journeys.SelectMany(x => x.Photos).ToList();

        var allFiles = await spaceService.List();
        
        foreach (var unusedFile in allFiles.Except(referencedFiles))
        {
            await spaceService.Delete(unusedFile);
        }
    }
}