using AIService.Domain.Entities;

namespace AIService.Domain.Repositories
{
    public interface ITokenDailyStatRepository : IRepository<TokenDailyStat>    
    {
        Task<TokenDailyStat?> GetByDateAsync(DateOnly date, CancellationToken cancellationToken);
    }
}
