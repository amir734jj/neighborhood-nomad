using Microsoft.AspNetCore.Http;

namespace Logic.Dtos.S3;

public class UploadFile
{
    public required IFormFile File { get; set; }
    
    public required string? Description { get; set; }
}