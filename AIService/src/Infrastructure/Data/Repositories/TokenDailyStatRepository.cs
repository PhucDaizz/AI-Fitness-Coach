using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class TokenDailyStatRepository : BaseRepository<TokenDailyStat>, ITokenDailyStatRepository
    {
        public TokenDailyStatRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<TokenDailyStat?> GetByDateAsync(DateOnly date, CancellationToken cancellationToken)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.Date == date, cancellationToken);
        }
    }
}
