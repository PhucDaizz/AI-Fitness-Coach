using AIService.Domain.Entities;

namespace AIService.Domain.Repositories
{
    public interface IToolDailyStatRepository: IRepository<ToolDailyStat>
    {
        Task<ToolDailyStat?> GetStatAsync(DateOnly date, string functionName, CancellationToken cancellationToken);
    }
}
