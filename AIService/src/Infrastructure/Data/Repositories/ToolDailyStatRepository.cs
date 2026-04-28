using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class ToolDailyStatRepository : BaseRepository<ToolDailyStat>, IToolDailyStatRepository
    {
        public ToolDailyStatRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<ToolDailyStat?> GetStatAsync(DateOnly date, string functionName, CancellationToken cancellationToken)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.Date == date && s.ToolName == functionName, cancellationToken);
        }
    }
}
