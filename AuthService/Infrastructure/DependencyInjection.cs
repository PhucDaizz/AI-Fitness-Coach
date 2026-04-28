using Application.Common.Interfaces;
using Application.Contracts;
using Application.Repositories;
using Infrastructure.Contracts;
using Infrastructure.Data.Repositories;
using Infrastructure.Persistence.SeedData;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;


namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
               options.UseMySql(
                   configuration.GetConnectionString("DefaultConnection"),
                   new MySqlServerVersion(new Version(8, 0, 21)),
                   b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            var redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString));

            services.AddTransient<IDatabase>(sp =>
            {
                var multiplexer = sp.GetRequiredService<IConnectionMultiplexer>();
                return multiplexer.GetDatabase();
            });

            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
            
            services.AddScoped<IDbInitializer, DbInitializer>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddScoped<ITokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IAuthRepository, AuthRepository>();

            services.AddScoped<IEmailServices, EmailServices>();
            services.AddScoped<IExternalAuthService, ExternalAuthService>();
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddSingleton<ICloudinaryService, CloudinaryService>();
            services.AddSingleton<IImageProcessor, ImageSharpProcessor>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddScoped<IDomainEventService, DomainEventService>();
            services.AddScoped<IIntegrationEventService, IntegrationEventService>();
            services.AddScoped<IExternalAuthService, ExternalAuthService>();

            return services;
        }
    }
}
