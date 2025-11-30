using System.Reflection;
using Api.Extensions;
using Hangfire;
using Logic.Interfaces;
using Scrutor;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 5 * 1024 * 1024; // 5 MB
});

// This is needed to be able to store DateTimeOffset with zone other than UTC
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

builder.SetupLogger();
builder.SetupSwagger();
builder.SetupDatabase();
builder.SetupAuthentication();
builder.SetupControllers();
builder.SetupS3();
builder.SetupHangfire();
builder.SetupBackgroundJobs(Assembly.Load("Logic"));
builder.SetupAntiForgeryTokens();
builder.AllowLazyInitialization(Assembly.Load("Logic"));

builder.Services.AddResponseCompression();

builder.Services
    .AddLogging(cfg => cfg.AddSerilog(dispose: true))
    .AddGeocodio()
    .AddResponseCompression()
    .AddEndpointsApiExplorer()
    .AddMvc();

builder.Services.Scan(scan => scan
    .FromAssemblies(Assembly.Load("Logic"))
    .AddClasses()
    .UsingRegistrationStrategy(RegistrationStrategy.Skip) // 2. Define how to handle duplicates
    .AsImplementedInterfaces() // 2. Specify which services they are registered as
    .WithTransientLifetime()); // 3. Set the lifetime for the services

var app = builder.Build();


var recurringJobManager =  app.Services.CreateScope().ServiceProvider.GetService<IRecurringJobManager>();
foreach (var job in app.Services.CreateScope()
             .ServiceProvider
             .GetRequiredService<IEnumerable<IJob>>())
{
    recurringJobManager.AddOrUpdate<IJob>(
        job.GetType().Name,
        ctx => ctx.ExecuteAsync(),
        job.Schedule);
}

app.Use(async (context, next) =>
{
    // Enable buffering for the request body
    // this is needed to be able to log request body when there is an exception
    context.Request.EnableBuffering();

    // Proceed to the next middleware
    await next.Invoke();
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseSpaStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // static files are cached at most 1 hour, this is needed when we deploy new UI code
        // the customers don't have to hard-refresh their browsers
        ctx.Context.Response.Headers.CacheControl = "public,max-age=3600";
    }
});
app.UseResponseCompression();
app.UseSerilogRequestLogging(_ => {});

app
    .UseRouting()
    .UseAuthentication()
    .UseAuthorization()
    .UseEndpoints(endpoints =>
    {
        if (app.Environment.IsDevelopment())
        {
            endpoints.MapHangfireDashboard("/api/hangfire");
        }
        
        endpoints.MapControllers();
        endpoints.MapFallBack();
    });

if (app.Environment.IsProduction())
{
    app.UseSpa(_ => { });
}

await app.RunAsync();
