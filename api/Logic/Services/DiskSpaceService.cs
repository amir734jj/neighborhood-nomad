using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Logic.Dtos.S3;
using Newtonsoft.Json;

namespace Logic.Services;

public class DiskSpaceService : ISpaceService
{
    private class FileEntry
    {
        public string TempFilePath { get; init; } = null!;
        public string FileName { get; init; } = null!;
        public string ContentType { get; init; } = null!;
        public Dictionary<string, string> Metadata { get; init; } = null!;
    }

    private readonly string _tempDir;

    public DiskSpaceService()
    {
        _tempDir = Path.Combine(Path.GetTempPath(), "TempFileSpaceService");
        Directory.CreateDirectory(_tempDir);
    }

    public async Task<GenericFileServiceResponse> Upload(string fileKey,
        string fileName, string contentType,
        Stream data,
        IDictionary<string, string> metadata)
    {
        var tempFilePath = Path.Combine(_tempDir, fileKey);
        var metadataPath = GetMetadataPath(fileKey);

        await using var fileStream = File.Create(tempFilePath);
        await data.CopyToAsync(fileStream);

        var fileEntry = new FileEntry
        {
            TempFilePath = tempFilePath,
            FileName = fileName,
            ContentType = contentType,
            Metadata = new Dictionary<string, string>(metadata)
        };

        await File.WriteAllTextAsync(metadataPath, JsonConvert.SerializeObject(fileEntry));

        return new GenericFileServiceResponse(HttpStatusCode.OK, fileKey);
    }

    public async Task<DownloadFileServiceResponse> Download(string? keyName)
    {
        if (keyName == null)
        {
            return new DownloadFileServiceResponse(HttpStatusCode.BadRequest, "Missing key");
        }

        var metadataPath = GetMetadataPath(keyName);
        if (!File.Exists(metadataPath))
        {
            return new DownloadFileServiceResponse(HttpStatusCode.NotFound, "Metadata not found");
        }

        var entry = JsonConvert.DeserializeObject<FileEntry>(await File.ReadAllTextAsync(metadataPath));
        if (entry == null || !File.Exists(entry.TempFilePath))
        {
            return new DownloadFileServiceResponse(HttpStatusCode.NotFound, "File not found");
        }

        var data = await File.ReadAllBytesAsync(entry.TempFilePath);

        return new DownloadFileServiceResponse(
            HttpStatusCode.OK,
            "Success",
            data,
            entry.Metadata.AsReadOnly(),
            entry.ContentType,
            entry.FileName
        );
    }

    public Task<GenericFileServiceResponse> Delete(string keyName)
    {
        var metadataPath = GetMetadataPath(keyName);
        if (!File.Exists(metadataPath))
        {
            return Task.FromResult(new GenericFileServiceResponse(HttpStatusCode.NotFound, "File not found"));
        }

        var entry = JsonConvert.DeserializeObject<FileEntry>(File.ReadAllText(metadataPath));
        if (entry != null && File.Exists(entry.TempFilePath))
        {
            File.Delete(entry.TempFilePath);
        }

        File.Delete(metadataPath);
        return Task.FromResult(new GenericFileServiceResponse(HttpStatusCode.OK, keyName));
    }

    public Task<List<string>> List()
    {
        var keys = Directory.EnumerateFiles(_tempDir, "*.json")
            .Select(Path.GetFileNameWithoutExtension)
            .ToList();
        return Task.FromResult(keys)!;
    }

    public Task<List<MetadataFileServiceResponse>> ListWithMetadata()
    {
        var list = Directory.EnumerateFiles(_tempDir, "*.json")
            .Select(path =>
            {
                var json = File.ReadAllText(path);
                var entry = JsonConvert.DeserializeObject<FileEntry>(json);
                var key = Path.GetFileNameWithoutExtension(path);
                return entry == null ? null : new MetadataFileServiceResponse(
                    key,
                    entry.Metadata.AsReadOnly(),
                    entry.ContentType,
                    entry.FileName);
            })
            .Where(x => x != null)
            .ToList()!;
        
        return Task.FromResult(list)!;
    }

    public Task<bool> ContainsKey(string fileKey)
    {
        return Task.FromResult(File.Exists(Path.Combine(_tempDir, GetMetadataPath(fileKey))));
    }

    private string GetMetadataPath(string key) => Path.Combine(_tempDir, $"{key}.json");
}
