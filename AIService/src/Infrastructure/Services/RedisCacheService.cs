using AIService.Application.Common.Interfaces;
using StackExchange.Redis;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDatabase _database;

        public RedisCacheService(IDatabase database)
        {
            _database = database;
        }

        public async Task AppendToChatHistoryAsync(Guid sessionId, object messageDto, TimeSpan? expiry = null)
        {
            string key = $"chat_history:{sessionId}";
            string json = JsonSerializer.Serialize(messageDto);

            await _database.ListRightPushAsync(key, json);

            await _database.ListTrimAsync(key, -20, -1);

            if (expiry.HasValue)
            {
                await _database.KeyExpireAsync(key, expiry.Value);
            }
        }

        public async Task<List<T>> GetRecentChatHistoryAsync<T>(Guid sessionId, int limit)
        {
            string key = $"chat_history:{sessionId}";

            var values = await _database.ListRangeAsync(key, -limit, -1);

            if (values.Length == 0) return new List<T>();

            return values.Select(v => JsonSerializer.Deserialize<T>(v!)!).ToList();
        }

        public async Task<bool> HasChatHistoryAsync(Guid sessionId)
        {
            string key = $"chat_history:{sessionId}";
            return await _database.KeyExistsAsync(key);
        }

        public async Task RefreshChatHistoryAsync<T>(Guid sessionId, List<T> recentMessages, TimeSpan? expiry = null)
        {
            string key = $"chat_history:{sessionId}";

            await _database.KeyDeleteAsync(key);

            if (recentMessages != null && recentMessages.Any())
            {
                var redisValues = recentMessages.Select(m => (RedisValue)JsonSerializer.Serialize(m)).ToArray();

                await _database.ListRightPushAsync(key, redisValues);

                if (expiry.HasValue)
                {
                    await _database.KeyExpireAsync(key, expiry.Value);
                }
            }
        }
    }
}
