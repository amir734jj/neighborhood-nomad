using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Amazon.S3.Util;
using Data.Utilities;
using Logic.Dtos.S3;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Models.Constants;

namespace Logic.Services;

public class SpacesService(ILogger<SpacesService> logger, AmazonS3Client client, S3ServiceConfig s3ServiceConfig, IMemoryCache memoryCache) : ISpaceService
{
    private const string Prefix = "files";
    
    private static string GetPath(string key) => $"{Prefix}/{key}";
    
    public async Task<GenericFileServiceResponse> Upload(
        string fileKey,
        string fileName,
        string contentType,
        Stream data,
        IDictionary<string, string> metadata)
    {
        try
        {
            if (await AmazonS3Util.DoesS3BucketExistV2Async(client, s3ServiceConfig.BucketName))
            {
                var fileTransferUtility = new TransferUtility(client);

                var fileTransferUtilityRequest = new TransferUtilityUploadRequest
                {
                    Key = GetPath(fileKey),
                    InputStream = data,
                    BucketName = s3ServiceConfig.BucketName,
                    CannedACL = S3CannedACL.PublicRead,
                };

                metadata[FileUploadConstants.Date] = DateTimeOffset.UtcNow.ToString();
                metadata[FileUploadConstants.Name] = fileName;
                metadata[FileUploadConstants.ContentType] = contentType;

                foreach (var (key, value) in metadata) fileTransferUtilityRequest.Metadata.Add(key, value);

                await fileTransferUtility.UploadAsync(fileTransferUtilityRequest);

                return new GenericFileServiceResponse(HttpStatusCode.OK, "Successfully uploaded to S3");
            }

            // Bucket not found
            throw new Exception($"Bucket: {s3ServiceConfig.BucketName} does not exist");
        }
        // Catch specific amazon errors
        catch (AmazonS3Exception e)
        {
            logger.LogError(e, "Failed uploading to S3 with S3 specific exception");

            return new GenericFileServiceResponse(e.StatusCode, e.Message);
        }
        // Catch other errors
        catch (Exception e)
        {
            logger.LogError(e, "Failed uploading to S3 with generic exception");

            return new GenericFileServiceResponse(HttpStatusCode.BadRequest, e.Message);
        }
    }

    public async Task<DownloadFileServiceResponse> Download(string? keyName)
    {
        if (string.IsNullOrEmpty(keyName))
        {
            return new DownloadFileServiceResponse(HttpStatusCode.BadRequest, "Invalid empty key name");
        }
        
        try
        {
            // Prefix class name
            var cacheKey = StringUtilities.ToMemoryCacheKey<SpacesService>(keyName);
            
            // Lookup from cache, only success ones
            // This means if there was a 404, it actually calls S3
            if (memoryCache.TryGetValue<DownloadFileServiceResponse>(cacheKey, out var cacheEntry) && cacheEntry!.Status == HttpStatusCode.OK)
            {
                return cacheEntry;
            }

            // Build the request with the bucket name and the keyName (name of the file)
            var request = new GetObjectRequest
            {
                BucketName = s3ServiceConfig.BucketName,
                Key = GetPath(keyName)
            };

            using var response = await client.GetObjectAsync(request);
            await using var responseStream = response.ResponseStream;
            await using var memoryStream = new MemoryStream();
            var metadata = GetSanitizedMetadata(response.Metadata);

            // Copy stream to another stream
            await responseStream.CopyToAsync(memoryStream);

            var fileName = metadata[FileUploadConstants.Name];
            var contentType = metadata[FileUploadConstants.ContentType];

            var downloadResult = new DownloadFileServiceResponse(
                HttpStatusCode.OK,
                "Successfully downloaded S3 object",
                memoryStream.ToArray(), metadata, contentType, fileName);

            // cache response if size <= 1MB
            var sizeInMb = memoryStream.Length / (1024.0 * 1024.0);

            if (sizeInMb <= 1)
            {
                memoryCache.Set(cacheKey, downloadResult, new MemoryCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromMinutes(1)
                });
            }
            
            return downloadResult;
        }
        // Catch specific amazon errors
        catch (AmazonS3Exception e)
        {
            logger.LogError(e, "Failed uploading from S3 with S3 specific exception");

            return new DownloadFileServiceResponse(e.StatusCode, e.Message);
        }
        // Catch other errors
        catch (Exception e)
        {
            logger.LogError(e, "Failed downloading from S3 with generic exception");

            return new DownloadFileServiceResponse(HttpStatusCode.BadRequest, e.Message);
        }
    }

    public async Task<GenericFileServiceResponse> Delete(string keyName)
    {
        try
        {
            // Build the request with the bucket name and the keyName (name of the file)
            var request = new DeleteObjectRequest
            {
                BucketName = s3ServiceConfig.BucketName,
                Key = GetPath(keyName)
            };

            var response = await client.DeleteObjectAsync(request);
            return new GenericFileServiceResponse(
                response.HttpStatusCode == HttpStatusCode.NoContent ? HttpStatusCode.OK : response.HttpStatusCode,
                $"Deleting S3 object with key: {keyName}");
        }
        // Catch specific amazon errors
        catch (AmazonS3Exception e)
        {
            logger.LogError(e, "Failed deleting from S3 with S3 specific exception");

            return new GenericFileServiceResponse(e.StatusCode, e.Message);
        }
        // Catch other errors
        catch (Exception e)
        {
            logger.LogError(e, "Failed downloading from S3 with generic exception");

            return new GenericFileServiceResponse(HttpStatusCode.BadRequest, e.Message);
        }
    }

    public async Task<List<string>> List()
    {
        var request = new ListObjectsV2Request
        {
            BucketName = s3ServiceConfig.BucketName,
            Prefix = Prefix
        };

        var result = await client.ListObjectsV2Async(request);

        return result.S3Objects?.Where(x => x.Key[(Prefix.Length + 1)..].Length > 0).Select(x => x.Key).ToList() ?? [];
    }

    public async Task<List<MetadataFileServiceResponse>> ListWithMetadata()
    {
        var request = new ListObjectsV2Request
        {
            BucketName = s3ServiceConfig.BucketName,
            Prefix = Prefix
        };

        var result = await client.ListObjectsV2Async(request);

        return (await Task.WhenAll(result.S3Objects?.Where(x => x.Key[(Prefix.Length + 1)..].Length > 0)
            .Select(async x =>
            {
                var metadataResponse = await client.GetObjectMetadataAsync(new GetObjectMetadataRequest
                {
                    Key = x.Key,
                    BucketName = s3ServiceConfig.BucketName,
                });
                
                var metadata = GetSanitizedMetadata(metadataResponse.Metadata);
                var fileName = metadata[FileUploadConstants.Name];
                var contentType = metadata[FileUploadConstants.ContentType];

                return new MetadataFileServiceResponse(x.Key, metadata, contentType, fileName);
            }) ?? [])).ToList();
    }

    public async Task<bool> ContainsKey(string fileKey)
    {
        try
        {
            var response = await client.GetObjectMetadataAsync(new GetObjectMetadataRequest
            {
                BucketName = s3ServiceConfig.BucketName,
                Key = fileKey
            });
            
            return response.HttpStatusCode == HttpStatusCode.OK;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    private static Dictionary<string, string> GetSanitizedMetadata(MetadataCollection metadataCollection)
    {
        return metadataCollection.Keys.ToDictionary(k => k.StartsWith("x-amz-meta-") ? k["x-amz-meta-".Length..] : k, k => metadataCollection[k]);
    }
}
