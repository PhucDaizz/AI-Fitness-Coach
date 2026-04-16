using API.StartUp;
using Application;
using Auth.API.Common.ExceptionHandling;
using Auth.API.ExceptionHandling;
using Auth.API.Extensions;
using Infrastructure;
using Infrastructure.BackgroundJobs.Consumer.User;
using Infrastructure.Persistence.SeedData;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Nexus.BuildingBlocks.Extensions;
using System.Diagnostics;

namespace API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.Configure<CloudinarySettings>(
                builder.Configuration.GetSection(CloudinarySettings.SectionName)
            );
            builder.Services.Configure<AdminAccountOptions>(
                builder.Configuration.GetSection(AdminAccountOptions.SectionName)
            );
            builder.Services.Configure<JwtSettings>(
                builder.Configuration.GetSection(JwtSettings.SectionName)
            );
            builder.Services.Configure<EmailSettings>(
                builder.Configuration.GetSection(EmailSettings.SectionName)
            );
            builder.Services.Configure<GoogleSettings>(
                builder.Configuration.GetSection(GoogleSettings.SectionName)
            );
            builder.Services.Configure<FrontendSettings>(
                builder.Configuration.GetSection(FrontendSettings.SectionName)
            );

            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor |
                                           ForwardedHeaders.XForwardedProto |
                                           ForwardedHeaders.XForwardedHost;

                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });

            builder.AddDependencies();

            builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddHealthChecks();

            builder.Services.AddProblemDetails(options =>
            {
                options.CustomizeProblemDetails = context =>
                {
                    context.ProblemDetails.Instance = $"{context.HttpContext.Request.Method} {context.HttpContext.Request.Path}";
                    context.ProblemDetails.Extensions.TryAdd("requestId", context.HttpContext.TraceIdentifier);
                    Activity? activity = context.HttpContext.Features.Get<IHttpActivityFeature>()?.Activity;
                    context.ProblemDetails.Extensions.TryAdd("traceId", activity?.Id);
                };
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:5173") 
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    });
            });


            builder.Services.AddAuthenticationAndAuthorization(builder.Configuration);

            builder.Services.AddInfrastructure(builder.Configuration);
            builder.Services.AddApplication();
            builder.Services.AddSharedRabbitMQ(builder.Configuration);

            builder.Services.AddHostedService<UserEventsConsumer>();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<ApplicationDbContext>();
                    if (context.Database.GetPendingMigrations().Any())
                    {
                        await context.Database.MigrateAsync();
                    }

                    var initializer = services.GetRequiredService<IDbInitializer>();
                    await initializer.SeedAsync(); 
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "Loi khi tai du lieu.");
                }
            }
            app.UseExceptionHandler();
            app.UseForwardedHeaders();
            app.UseSwaggerConfiguration();

            app.UseCors("AllowReactApp");

            // app.UseHttpsRedirection();

            /*app.Use((context, next) =>
            {
                context.Request.Scheme = "http";
                // Đổi thành "localhost" và "7000" (Cổng của Ocelot)
                // Lưu ý: Đang test local thì để localhost:7000. 
                // Mốt deploy lên server thật thì đổi chỗ này thành Domain của server nhé!
                context.Request.Host = new HostString("localhost", 7000); 
                return next();
            });*/

            app.MapHealthChecks("/health"); 

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
