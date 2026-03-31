using AIService.API.Common.ExceptionHandling;
using AIService.API.ExceptionHandling;
using AIService.API.Extensions;
using AIService.API.StartUp;
using AIService.Application;
using AIService.Infrastructure;
using Microsoft.AspNetCore.Http.Features;
using Nexus.BuildingBlocks.Extensions;
using System.Diagnostics;

namespace AIService.API
{
    public class Program
    {
        public static void Main(string[] args)
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
            var app = builder.Build();

            app.UseExceptionHandler();

            app.UseSwaggerConfiguration();

            app.UseHttpsRedirection();

            app.MapHealthChecks("/health");

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
