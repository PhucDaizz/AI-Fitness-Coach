
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

namespace APIGateway
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration
                .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"ocelot.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("GatewayCors", policy =>
                {
                    policy.SetIsOriginAllowed(_ => true)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            builder.Services.AddOcelot(builder.Configuration);

            var app = builder.Build();

            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/health")
                {
                    await context.Response.WriteAsJsonAsync(new
                    {
                        service = "api-gateway",
                        status = "healthy",
                        timestamp = DateTimeOffset.UtcNow
                    });
                    return;
                }

                context.Request.Headers["X-Forwarded-Host"] = context.Request.Host.Value;
                context.Request.Headers["X-Forwarded-Proto"] = context.Request.Scheme;

                if (context.Request.Path.StartsWithSegments("/auth/swagger"))
                {
                    context.Request.Headers["X-Forwarded-Prefix"] = "/auth";
                }
                else if (context.Request.Path.StartsWithSegments("/ai/swagger"))
                {
                    context.Request.Headers["X-Forwarded-Prefix"] = "/ai";
                }

                await next();
            });

            app.UseCors("GatewayCors");
            app.UseWebSockets();

            await app.UseOcelot();
            await app.RunAsync();
        }
    }
}
