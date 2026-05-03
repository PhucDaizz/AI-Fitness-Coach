namespace AIService.Application.Common.Interfaces
{
    public interface ICacheService
    {
        Task AppendToChatHistoryAsync(Guid sessionId, object messageDto, TimeSpan? expiry = null);
        Task<List<T>> GetRecentChatHistoryAsync<T>(Guid sessionId, int limit);
        Task RefreshChatHistoryAsync<T>(Guid sessionId, List<T> recentMessages, TimeSpan? expiry = null);
        Task<bool> HasChatHistoryAsync(Guid sessionId);
        Task IncrementOnlineUserAsync(string userId);
        Task<long> DecrementOnlineUserAsync(string userId);
        Task RemoveOnlineUserAsync(string userId);
        Task<long> GetOnlineUsersCountAsync();
        Task DeleteChatHistoryAsync(Guid sessionId);
    }
}
