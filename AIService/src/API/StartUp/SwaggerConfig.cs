using Microsoft.OpenApi.Models;
using System.Reflection;

namespace AIService.API.StartUp
{
    public static class SwaggerConfig
    {
        public static void AddSwaggerServices(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
        }
        public static void UseSwaggerConfiguration(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger(options =>
                {
                    options.PreSerializeFilters.Add((swaggerDoc, request) =>
                    {
                        if (!request.Headers.TryGetValue("X-Forwarded-Prefix", out var serverPrefixValues))
                        {
                            return;
                        }

                        var serverPrefix = serverPrefixValues.FirstOrDefault();
                        if (string.IsNullOrWhiteSpace(serverPrefix))
                        {
                            return;
                        }

                        swaggerDoc.Servers = new List<OpenApiServer>
                        {
                            new() { Url = serverPrefix }
                        };

                        var paths = new OpenApiPaths();
                        foreach (var path in swaggerDoc.Paths)
                        {
                            var key = path.Key.StartsWith("/api/", StringComparison.OrdinalIgnoreCase)
                                ? path.Key[4..]
                                : path.Key;

                            paths.Add(key, path.Value);
                        }

                        swaggerDoc.Paths = paths;
                    });
                });
                app.UseSwaggerUI();
            }
        }
    }
}
