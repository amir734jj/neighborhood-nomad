using System;
using System.Collections.Generic;
using System.Net;

namespace Logic.Dtos.S3;

public class DownloadFileServiceResponse : GenericFileServiceResponse
{
    public DownloadFileServiceResponse(HttpStatusCode statusCode, string message) : base(statusCode, message)
    {
    }

    public DownloadFileServiceResponse(
        HttpStatusCode status,
        string message,
        byte[] data,
        IReadOnlyDictionary<string, string> metaData,
        string contentType,
        string name) : base(status, message)
    {
        Data = data;
        MetaData = metaData;
        ContentType = contentType;
        Name = name;
    }

    public byte[]? Data { get; }

    public IReadOnlyDictionary<string, string>? MetaData { get; }

    public string? ContentType { get; }

    public string? Name { get; }

    public string AsDataUrl()
    {
        if (ContentType == null || Data == null)
        {
            return $"data:application/octet-stream;base64,{Convert.ToBase64String(Array.Empty<byte>())}";
        }
 
        var base64String = Convert.ToBase64String(Data);

        return $"data:{ContentType};base64,{base64String}";
    }
}