using AIService.API.Common.ExceptionHandling;
using AIService.API.ExceptionHandling;
using AIService.API.Extensions;
using AIService.API.StartUp;
using AIService.Application;
using AIService.Application.Common.Interfaces;
using AIService.Infrastructure;
using AIService.Infrastructure.BackgroundJobs.Consumer;
using AIService.Infrastructure.Data.Seeders;
using AIService.Infrastructure.Services;
using Microsoft.AspNetCore.Http.Features;
using Nexus.BuildingBlocks.Extensions;
using System.Diagnostics;

namespace AIService.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

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

            builder.Services.AddAuthenticationAndAuthorization(builder.Configuration);

            builder.Services.AddSharedRabbitMQ(builder.Configuration);

            builder.AddDependencies();
            builder.Services.AddInfrastructure(builder.Configuration);
            builder.Services.AddApplication();

            var aiProvider = builder.Configuration["AI_Provider"] ?? "Ollama";

            if (aiProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
            {
                builder.Services.AddSingleton<IEmbeddingService, OpenAiEmbeddingService>();
            }
            else
            {
                builder.Services.AddHttpClient<OllamaEmbeddingService>();
                builder.Services.AddSingleton<IEmbeddingService, OllamaEmbeddingService>();
            }
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddHostedService<EmbeddingConsumer>();

            var app = builder.Build();

            app.UseExceptionHandler();

            app.UseSwaggerConfiguration();

            //app.UseHttpsRedirection();

            app.MapHealthChecks("/health");

            app.UseAuthorization();

            app.MapControllers();
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var logger = services.GetRequiredService<ILogger<Program>>();

                try
                {
                    int maxRetries = 5;
                    for (int retry = 1; retry <= maxRetries; retry++)
                    {
                        try
                        {
                            logger.LogInformation($"[Lần {retry}/{maxRetries}] Đang kết nối DB và điều phối bơm dữ liệu...");

                            var coordinator = services.GetRequiredService<DataSeederCoordinator>();

                            await coordinator.ExecuteAsync();

                            break; 
                        }
                        catch (Exception ex)
                        {
                            if (retry == maxRetries) throw;

                            logger.LogWarning($"⏳ Database chưa sẵn sàng. Đợi 5 giây rồi thử lại... (Lỗi: {ex.Message})");

                            await Task.Delay(5000);
                        }
                    }
                }
                catch (Exception ex)
                {
                    logger.LogCritical(ex, "FATAL ERROR: Không thể khởi tạo Database!");
                }
            }


            app.Run();
        }
    }
}
