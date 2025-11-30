using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Logic.Dtos.S3;

namespace Logic.Services;

public interface ISpaceService
{
    Task<GenericFileServiceResponse> Upload(string fileKey,
        string fileName, string contentType,
        Stream data,
        IDictionary<string, string> metadata);

    Task<DownloadFileServiceResponse> Download(string? keyName);

    Task<GenericFileServiceResponse> Delete(string keyName);

    Task<List<string>> List();

    Task<List<MetadataFileServiceResponse>> ListWithMetadata();

    Task<bool> ContainsKey(string fileKey);
}