namespace Logic.Dtos.S3;

public class S3ServiceConfig
{
    public required string BucketName { get; init; }

    public required string EndpointUrl { get; init; }
}