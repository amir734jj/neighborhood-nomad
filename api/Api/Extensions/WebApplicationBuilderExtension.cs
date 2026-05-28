using System.Reflection;
using System.Security.Claims;
using System.Text;
using Amazon.Runtime;
using Amazon.S3;
using Api.Attributes;
using Api.Configs;
using Data;
using EfCoreRepository.Extensions;
using Hangfire;
using Hangfire.Console.Extensions;
using Hangfire.Console.Extensions.Serilog;
using Hangfire.MemoryStorage;
using Logic.Dtos.S3;
using Logic.Interfaces;
using Logic.Services;
using Logic.Utility;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Models.Entities;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Npgsql;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Exceptions.Core;
using Serilog.Exceptions.EntityFrameworkCore.Destructurers;
using ILogger = Microsoft.Extensions.Logging.ILogger;
using static Data.Utilities.ConnectionStringUtility;

namespace Api.Extensions;

public static class WebApplicationBuilderExtension
{
    extension(WebApplicationBuilder builder)
    {
        public void SetupS3()
        {
            if (builder.Environment.IsProduction())
            {
                var credentials = new BasicAWSCredentials(
                    builder.Configuration.GetRequiredValue<string>("SPACES_KEY"),
                    builder.Configuration.GetRequiredValue<string>("SPACES_SECRET"));

                builder.Services.AddSingleton(builder.Configuration.GetRequiredSection("S3").GetRequiredValue<S3ServiceConfig>());

                builder.Services.AddTransient<AmazonS3Client>(x =>
                {
                    var s3ServiceConfig = x.GetRequiredService<S3ServiceConfig>();
                    
                    var endpoint = builder.Configuration.GetValue<string>("SPACES_ENDPOINT") ?? s3ServiceConfig.EndpointUrl;
                    
                    var config = new AmazonS3Config
                    {
                        ServiceURL = endpoint,
                        RetryMode = RequestRetryMode.Standard   // standard retry when talking to S3 (space service)
                    };

                    return new AmazonS3Client(credentials, config);
                });
            
                builder.Services.AddTransient<ISpaceService, SpacesService>();
            }
            else
            {
                builder.Services.AddTransient<ISpaceService, DiskSpaceService>();
            }
        }

        public void SetupSwagger()
        {
            builder.Services.AddSwaggerGen(opt =>
            {
                opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please insert JWT token with Bearer prefix in the format: Bearer {token}",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer"
                });

                opt.AddSecurityRequirement(_ => new OpenApiSecurityRequirement { { new OpenApiSecuritySchemeReference("Bearer"), [] } });
            });
        }

        public void SetupDatabase()
        {
            var postgresConnectionString = ConnectionStringUrlToPgResource(
                builder.Configuration.GetRequiredValue<string>("DATABASE_URL"),
                connectionStringBuilder =>
                {
                    if (builder.Environment.IsDevelopment())
                    {
                        connectionStringBuilder.MaxPoolSize = 3;
                    }
                });

            var dataSourceBuilder = new NpgsqlDataSourceBuilder(postgresConnectionString);

            // Enable json support
            dataSourceBuilder.UseJsonNet();

            // Register the data source as a singleton
            builder.Services.AddSingleton(dataSourceBuilder.Build());
        
            builder.Services.AddDbContextFactory<DatabaseContext>((serviceProvider, opt) =>
            {
                opt.EnableSensitiveDataLogging(builder.Environment.IsDevelopment())
                    .UseNpgsql(serviceProvider.GetRequiredService<NpgsqlDataSource>(), x =>
                    {
                        x.UseQuerySplittingBehavior(QuerySplittingBehavior.SingleQuery);
                    });
            }).AddDistributedMemoryCache();
        
            builder.Services.AddIdentity<User, Role>(x =>
                {
                    x.User.RequireUniqueEmail = true;
                    x.Lockout.AllowedForNewUsers = true;
                    x.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(2);
                    x.Lockout.MaxFailedAccessAttempts = 3;
                })
                .AddEntityFrameworkStores<DatabaseContext>()
                .AddDefaultTokenProviders();

            builder.Services.AddEfRepository<DatabaseContext>(x =>
            {
                x.Profile(Assembly.GetAssembly(typeof(DatabaseContext)));
            });
        }

        public void SetupControllers()
        {
            builder.Services
                .AddControllers(x =>
                {
                    // If environment is development then no auth is needed
                    if (builder.Environment.IsDevelopment())
                    {
                        x.Filters.Add<AllowAnonymousFilter>(int.MaxValue);
                    }

                    x.Filters.Add<ExceptionFilterAttribute>();
                })
                .AddNewtonsoftJson(x =>
                {
                    x.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
                    x.SerializerSettings.Converters.Add(new StringEnumConverter());
                });

            builder.Services.AddSpaStaticFiles(cfg =>
            {
                cfg.RootPath = "wwwroot";
            });
        }

        public void SetupLogger()
        {
            Func<LogEvent, bool> logFilterExpr = x =>
                x.Properties.TryGetValue("RequestPath", out var requestPath) &&
                requestPath.ToString().Contains("/api/health");
        
            builder.Host.UseSerilog((hostingBuilder, cfg) =>
            {
                // request is "/api/health" (included " in the string representation itself)
                cfg.Filter.ByExcluding(logFilterExpr);
                cfg.Enrich.FromLogContext();
                cfg.WriteTo.Console(
                    outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {user} {Message:lj}{NewLine}{Exception}");

                cfg.Enrich.WithExceptionDetails(new DestructuringOptionsBuilder()
                    .WithDefaultDestructurers()
                    .WithDestructurers([new DbUpdateExceptionDestructurer()]));

                cfg.Enrich.WithHangfireContext();

                if (hostingBuilder.HostingEnvironment.IsProduction())
                {     
                    // Filter out Microsoft and System logs that are lower than warning
                    cfg.MinimumLevel.Override("Microsoft", LogEventLevel.Warning);
                    cfg.MinimumLevel.Override("System", LogEventLevel.Error);
                    cfg.MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning);
                    cfg.MinimumLevel.Override("Microsoft.AspNetCore.Hosting", LogEventLevel.Warning);
                    cfg.MinimumLevel.Override("Microsoft.AspNetCore.Mvc", LogEventLevel.Warning);
                    cfg.MinimumLevel.Override("Microsoft.AspNetCore.Routing", LogEventLevel.Warning);
                    cfg.MinimumLevel.Override("Microsoft.AspNetCore.Hosting.Diagnostics", LogEventLevel.Warning);
                    cfg.MinimumLevel.Override("Microsoft.AspNetCore.Routing.EndpointMiddleware", LogEventLevel.Warning);
                }
            });
        
            // Generic logger
            builder.Services.AddTransient<ILogger>(cfg => cfg.GetRequiredService<ILogger<Program>>());
        }

        public void SetupAntiForgeryTokens()
        {
            builder.Services.AddDataProtection()
                .PersistKeysToFileSystem(Directory.CreateTempSubdirectory());
        }

        public void AllowLazyInitialization(Assembly assembly) 
        {
            foreach (var type in assembly.ExportedTypes)
            {
                // ReSharper disable once InvertIf
                if (type is { IsInterface: true, IsPublic: true, IsGenericType: false })
                {
                    var lazyService = typeof(LazyService<>)
                        .MakeGenericType(type);
                
                    var lazyConstructor = lazyService
                        .GetConstructor([typeof(IServiceProvider)]);
   
                    builder.Services.Add(new ServiceDescriptor(
                        lazyService,
                        provider => lazyConstructor!.Invoke([provider]),
                        ServiceLifetime.Transient));
                }
            }
        }

        public void SetupAuthentication()
        {
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
            var jwtSecret = builder.Configuration.GetValue<string>("JWT_SECRET");

            jwtSettings.Key = !string.IsNullOrEmpty(jwtSecret)
                ? jwtSecret
                : builder.Environment.IsDevelopment()
                    ? "DevelopmentRandomKeyForTestingOnly"
                    : throw new Exception("JWT_SECRET is not configured.");

            builder.Services.AddSingleton(jwtSettings);

            builder.Services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(config =>
                {
                    config.RequireHttpsMetadata = false;
                    config.SaveToken = true;
                    config.UseSecurityTokenValidators = true;

                    config.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidateAudience = true,
                        ValidAudience = jwtSettings.Audience,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                        ClockSkew = TimeSpan.FromMinutes(5)
                    };
            
                    config.Events = new JwtBearerEvents
                    {
                        // Token is valid when user associated with the token is enabled
                        OnTokenValidated = async context =>
                        {
                            var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
                            var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    
                            if (userId != null)
                            {
                                var user = await userManager.FindByIdAsync(userId);
                                if (user is { Enabled: false })
                                {
                                    context.Fail($"User {user.UserName} is disabled.");
                                }
                            }
                        },
                        OnAuthenticationFailed = context =>
                        {
                            if (builder.Environment.IsDevelopment())
                            {
                                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                                logger.LogError(context.Exception, "JWT authentication failed: {message}", context.Exception.Message);
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
        }
        
        public void SetupHangfire()
        {
            builder.Services.AddHangfire(opt =>
                {
                    opt.SetDataCompatibilityLevel(CompatibilityLevel.Version_180);
                    opt.UseMemoryStorage();
                    opt.UseSimpleAssemblyNameTypeSerializer();
                    opt.UseRecommendedSerializerSettings();
                    opt.UseSerilogLogProvider();
                })
                .AddHangfireServer(opt =>
                {
                    // Degree of parallelism
                    opt.WorkerCount = 3;
                    opt.ServerTimeout = TimeSpan.FromHours(1);
                })
                .AddHangfireConsoleExtensions();
        }
        
        public void SetupBackgroundJobs(Assembly assembly)
        {
            foreach (var type in assembly.GetTypes().Where(t => typeof(IJob).IsAssignableFrom(t) && t is { IsClass: true, IsAbstract: false }))
            {
                builder.Services.AddTransient(typeof(IJob), type);
            }
        }
    }
}
