using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace AIService.API.Extensions
{
    public static class AuthenticationServiceExtensions
    {
        public static IServiceCollection AddAuthenticationAndAuthorization(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var secretKey = configuration["Jwt:Key"] ?? configuration["Jwt:SecretKey"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT Key not found in configuration!");
            }

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var issuer = configuration["Jwt:Issuer"];
                var audience = configuration["Jwt:Audience"];

                var allowedIssuers = configuration.GetSection("Jwt:AllowedIssuers").Get<string[]>();
                var allowedAudiences = configuration.GetSection("Jwt:AllowedAudiences").Get<string[]>();

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,

                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,

                    ValidIssuer = issuer,
                    ValidIssuers = allowedIssuers,
                    ValidAudience = audience,
                    ValidAudiences = allowedAudiences,

                    NameClaimType = ClaimTypes.NameIdentifier,
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.Request.Query.TryGetValue("access_token", out var token))
                        {
                            context.Token = token;
                        }
                        else
                        {
                            var authHeader = context.Request.Headers["Authorization"].ToString();
                            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                            {
                                context.Token = authHeader.Substring("Bearer ".Length).Trim();
                            }
                        }
                        return Task.CompletedTask;
                    },

                    OnAuthenticationFailed = context =>
                    {
                        var logger = context.HttpContext.RequestServices.GetService<ILogger<Program>>();
                        logger?.LogError($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },

                    OnTokenValidated = context =>
                    {
                        var principal = context.Principal;
                        var userId = principal?.FindFirstValue(ClaimTypes.NameIdentifier);

                        if (string.IsNullOrEmpty(userId))
                        {
                            userId = principal?.FindFirstValue("sub");
                        }

                        if (string.IsNullOrEmpty(userId))
                        {
                            Console.WriteLine("CẢNH BÁO: Token hợp lệ nhưng không tìm thấy User ID!");
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            /*services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy =>
                    policy.RequireClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", "Admin"));

                options.AddPolicy("ManagerOrAdmin", policy =>
                    policy.RequireClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", "Manager", "Admin"));

                options.AddPolicy("User", policy =>
                    policy.RequireClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", "User", "Manager", "Admin"));

                options.AddPolicy("ActiveStatus", policy =>
                    policy.RequireClaim("status", "Active"));
            });
*/
            return services;
        }
    }
}