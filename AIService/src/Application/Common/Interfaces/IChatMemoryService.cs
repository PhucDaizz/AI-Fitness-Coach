namespace AIService.Application.Common.Interfaces
{
    public interface IChatMemoryService 
    {
        Task<List<string>> GetRelevantContextAsync(
            string userId,
            string question,
            int limit = 3,
            CancellationToken cancellationToken = default);
    }
}
