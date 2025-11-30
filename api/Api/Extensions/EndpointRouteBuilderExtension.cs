using Microsoft.AspNetCore.Http.Extensions;

namespace Api.Extensions;

public static class EndpointRouteBuilderExtension
{
    public static void MapFallBack(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapFallback("api/{**rest}", async context =>
        {
            context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
            await context.Response.WriteAsync($"Failed to find the FallBack endpoint for {context.Request.Method}:{context.Request.GetDisplayUrl()}");
        });

        endpoints.MapFallback("", async context =>
        {
            context.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
            await context.Response.WriteAsync($"Failed to find the FallBack endpoint for {context.Request.Method}{context.Request.GetDisplayUrl()}");
        });
    }
}
