using Application.Repositories;

namespace Application.Common.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IAuthRepository Auth { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
