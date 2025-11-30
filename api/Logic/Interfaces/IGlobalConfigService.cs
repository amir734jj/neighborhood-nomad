using System.Collections.Generic;
using System.Threading.Tasks;
using Logic.Dtos.GlobalConfig;

namespace Logic.Interfaces;

public interface IGlobalConfigService
{
    Task<GlobalConfigModel> GetAllGlobalConfig();

    Task UpdateGlobalConfig(GlobalConfigModel config);

    Task<Dictionary<string, object>> GetPublicGlobalConfig();
}