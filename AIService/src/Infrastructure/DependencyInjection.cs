using AIService.Application.Common.Interfaces;
using AIService.Infrastructure.Data.Seeders;
using AIService.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AIService.Infrastructure
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

            services.Scan(scan => scan
                .FromAssembliesOf(typeof(IDataSeeder))
                .AddClasses(classes => classes.AssignableTo<IDataSeeder>())
                .AsImplementedInterfaces()
                .WithScopedLifetime());

            services.AddScoped<DataSeederCoordinator>();

            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

            services.AddScoped<IUnitOfWork, UnitOfWork>();


            services.AddScoped<IDomainEventService, DomainEventService>();
            services.AddScoped<IIntegrationEventService, IntegrationEventService>();

            return services;
        }
    }
}
