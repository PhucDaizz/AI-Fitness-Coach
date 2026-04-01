using AIService.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AIService.Infrastructure.Data.Seeders
{
    public class DataSeederCoordinator
    {
        private readonly IEnumerable<IDataSeeder> _seeders;
        private readonly IApplicationDbContext _context;
        private readonly ILogger<DataSeederCoordinator> _logger;

        public DataSeederCoordinator(
            IEnumerable<IDataSeeder> seeders,
            IApplicationDbContext context,
            ILogger<DataSeederCoordinator> logger)
        {
            _seeders = seeders.OrderBy(s => s.Order);
            _context = context;
            _logger = logger;
        }

        public async Task ExecuteAsync()
        {
            if (_context is DbContext dbContext)
            {
                await dbContext.Database.MigrateAsync();
            }

            foreach (var seeder in _seeders)
            {
                _logger.LogInformation($"Đang chạy Seeder: {seeder.GetType().Name}");
                await seeder.SeedAsync();
            }
        }
    }
}
