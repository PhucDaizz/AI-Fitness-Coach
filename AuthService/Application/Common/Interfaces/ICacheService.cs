namespace Application.Common.Interfaces
{
    public interface ICacheService
    {
        Task<long?> GetTotalUsersCountAsync();
        Task SetTotalUsersCountAsync(long count, TimeSpan? expiry = null);
        Task IncrementTotalUsersCountAsync();
    }
}
