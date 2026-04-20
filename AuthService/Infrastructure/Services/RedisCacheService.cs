using Application.Common.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDatabase _database;

        private const string TotalUsersKey = "System:TotalUsers";

        public RedisCacheService(IDatabase database)
        {
            _database = database;
        }


        public async Task<long?> GetTotalUsersCountAsync()
        {
            var value = await _database.StringGetAsync(TotalUsersKey);
            if (value.HasValue && long.TryParse(value, out long count))
            {
                return count;
            }
            return null;
        }

        public async Task SetTotalUsersCountAsync(long count, TimeSpan? expiry = null)
        {
            var ttl = expiry ?? TimeSpan.FromDays(1);
            await _database.StringSetAsync(TotalUsersKey, count, ttl);
        }

        public async Task IncrementTotalUsersCountAsync()
        {
            await _database.StringIncrementAsync(TotalUsersKey, 1);
        }
    }
}
