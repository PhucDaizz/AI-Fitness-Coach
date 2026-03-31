using Application.DTOs.User;
using Domain.Entities;

namespace Application.Repositories
{
    public interface IAuthRepository
    {
        Task<UserIdentityDto?> FindByEmailAsync(string email);
        Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken = default);
        Task<ExtendedIdentityUser?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<ExtendedIdentityUser?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<List<ExtendedIdentityUser>> GetUsersAsync(CancellationToken cancellationToken = default);
        Task UpdateUserAsync(ExtendedIdentityUser user, CancellationToken cancellationToken = default);


    }
}
