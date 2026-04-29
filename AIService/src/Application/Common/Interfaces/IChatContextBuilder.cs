namespace AIService.Application.Common.Interfaces
{
    public interface IChatContextBuilder
    {
        Task<(string EnglishQuestion, List<string> LongTermContext)> BuildContextAsync(
            string userId, string vietnameseQuestion, CancellationToken ct);
    }
}
