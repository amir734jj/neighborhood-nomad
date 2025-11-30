using System.Collections.Generic;

namespace Logic.Dtos.S3;

public class MetadataFileServiceResponse(
    string key,
    IReadOnlyDictionary<string, string> metadata,
    string contentType,
    string name)
{
    public IReadOnlyDictionary<string, string>? Metadata { get; } = metadata;

    public string? ContentType { get; } = contentType;

    public string? Name { get; } = name;
    
    public string? Key { get; } = key;
}