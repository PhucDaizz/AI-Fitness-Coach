using API;
using Domain.Entities;
using Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Auth.API.Extensions
{
    public static class AuthenticationServiceExtensions
    {
        public static IServiceCollection AddAuthenticationAndAuthorization(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddIdentity<ExtendedIdentityUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 6;

                options.User.RequireUniqueEmail = true;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>() 
            .AddDefaultTokenProviders()
            .AddSignInManager<SignInManager<ExtendedIdentityUser>>();

            // =========================================================================
            // SETUP AUTHENTICATION SCHEMES (Cookie, JWT, Google)
            // =========================================================================
            var secretKey = configuration["Jwt:Key"] ?? configuration["Jwt:SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT Key not found in configuration!");
            }

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var tokenExpiryMinutes = configuration.GetValue<int>("Jwt:TokenExpiryMinutes", 60);

            var issuer = configuration["Jwt:Issuer"] ?? "TravelNow";
            var audience = configuration["Jwt:Audience"] ?? "TravelNow-Users";

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignOutScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.Cookie.Name = "GoogleAuthCookie";
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
                options.SlidingExpiration = true;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                var issuer = configuration["Jwt:Issuer"];
                var audience = configuration["Jwt:Audience"];
                var allowedIssuers = configuration.GetSection("Jwt:AllowedIssuers").Get<string[]>();
                var allowedAudiences = configuration.GetSection("Jwt:AllowedAudiences").Get<string[]>();

                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,

                    ValidateIssuer = true,
                    ValidIssuer = issuer,
                    ValidIssuers = allowedIssuers,

                    ValidateAudience = true,
                    ValidAudience = audience,
                    ValidAudiences = allowedAudiences,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,

                    NameClaimType = ClaimTypes.NameIdentifier, 
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

                        if (string.IsNullOrEmpty(token) &&
                           context.Request.Query.TryGetValue("access_token", out var queryToken))
                        {
                            token = queryToken;
                        }

                        if (string.IsNullOrEmpty(token))
                        {
                            token = context.Request.Cookies["X-Access-Token"];
                        }

                        if (!string.IsNullOrEmpty(token))
                        {
                            context.Token = token;
                        }

                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                        logger.LogError(context.Exception, "JWT Authentication failed");

                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";

                        var errorMessage = context.Exception switch
                        {
                            SecurityTokenExpiredException => "Token has expired",
                            SecurityTokenInvalidSignatureException => "Invalid token signature",
                            SecurityTokenInvalidIssuerException => "Invalid token issuer",
                            SecurityTokenInvalidAudienceException => "Invalid token audience",
                            _ => "Authentication failed"
                        };

                        return context.Response.WriteAsJsonAsync(new
                        {
                            error = errorMessage,
                            code = "AUTH_FAILED"
                        });
                    },
                    OnTokenValidated = async context =>
                    {
                        // Chuyển sang dùng redis check blacklist
                        var userManager = context.HttpContext.RequestServices
                            .GetRequiredService<UserManager<ExtendedIdentityUser>>();

                        var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);

                        if (!string.IsNullOrEmpty(userId))
                        {
                            var user = await userManager.FindByIdAsync(userId);
                            if (user == null || !user.IsActive)
                            {
                                context.Fail("User not found or inactive");
                            }
                        }
                    }
                };
            })
            .AddGoogle("Google", options =>
            {
                options.ClientId = configuration["Google:ClientId"] ?? throw new InvalidOperationException("Google ClientId not configured");
                options.ClientSecret = configuration["Google:ClientSecret"] ?? throw new InvalidOperationException("Google ClientSecret not configured");

                options.CallbackPath = "/signin-google";
                options.SaveTokens = true;

                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.Scope.Add("openid");

                options.ClaimActions.MapJsonKey(ClaimTypes.GivenName, "given_name");
                options.ClaimActions.MapJsonKey(ClaimTypes.Surname, "family_name");
                options.ClaimActions.MapJsonKey("picture", "picture");
                options.ClaimActions.MapJsonKey("locale", "locale");

                options.Events = new OAuthEvents
                {
                    OnRemoteFailure = context =>
                    {
                        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                        logger.LogError(context.Failure, "Google OAuth failed");

                        var frontendUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
                        var errorMessage = Uri.EscapeDataString(context.Failure?.Message ?? "Google authentication failed");

                        context.Response.Redirect($"{frontendUrl}/login-failed?error={errorMessage}");
                        context.HandleResponse();

                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }
    }
}