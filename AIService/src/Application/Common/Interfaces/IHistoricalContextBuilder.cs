namespace AIService.Application.Common.Interfaces
{
    public interface IHistoricalContextBuilder
    {
        Task<string> BuildAsync(string userId, CancellationToken ct);
    }
}
