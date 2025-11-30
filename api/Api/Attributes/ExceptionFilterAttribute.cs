using System.Text;
using Logic.Dtos.Error;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Attributes;

public class ExceptionFilterAttribute(ILogger<ExceptionFilterAttribute> logger) : IAsyncExceptionFilter
{
    private static IEnumerable<string> ResolveExceptionMessages(Exception? exception)
    {
        return exception == null
            ? []
            : new[] { exception.Message }.Concat(ResolveExceptionMessages(exception.InnerException));
    }

    public async Task OnExceptionAsync(ExceptionContext context)
    {
        var request = context.HttpContext.Request;
        var user = context.HttpContext.User.Identity?.Name;
        var requestBody = await ReadRequestBodyAsString(request);

        logger.LogError(context.Exception, 
            "An exception occurred while handling request={Method}:{Request} by user={User}: {ExceptionType} - {Message}. Body={Body}",
            request.Method,
            request.GetDisplayUrl(),
            user ?? "anonymous",
            context.Exception.GetType().Name,
            context.Exception.Message,
            requestBody ?? "unavailable");

        var result = new BadRequestObjectResult(new ErrorViewModel(ResolveExceptionMessages(context.Exception).ToArray()));
        context.Result = result;
    }

    private static async Task<string?> ReadRequestBodyAsString(HttpRequest request)
    {
        string? requestBody = null;

        if (request.ContentLength > 0)
        {
            try
            {
                // Get the total size of the body (ContentLength)
                var totalSize = request.ContentLength ?? 0;

                // Make sure the body is seekable by enabling buffering
                request.EnableBuffering();

                // Move to the start of the body before reading
                request.Body.Seek(0, SeekOrigin.Begin);

                using var reader = new StreamReader(request.Body, leaveOpen: true);
                var buffer = new char[1024];
                int read;
                var builder = new StringBuilder();
                long totalRead = 0;

                // Read the body in chunks
                while ((read = await reader.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    builder.Append(buffer, 0, read);
                    totalRead += read;

                    // Optionally truncate if it exceeds a certain length (1KB max)
                    if (builder.Length >= 2048)
                    {
                        builder.Append($"...(truncated, total read={totalRead} bytes, total size: {totalSize} bytes)");
                        break;
                    }
                }

                requestBody = builder.ToString();

                // Reset to the original position after reading
                request.Body.Seek(0, SeekOrigin.Begin);
            }
            catch (Exception)
            {
                requestBody = "unavailable (error reading body)";
            }
        }

        return requestBody;
    }

}