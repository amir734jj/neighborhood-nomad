using System.Net;

namespace Logic.Dtos.S3;

public class GenericFileServiceResponse(HttpStatusCode status, string message)
{
    public HttpStatusCode Status { get; } = status;

    public string Message { get; } = message;
}