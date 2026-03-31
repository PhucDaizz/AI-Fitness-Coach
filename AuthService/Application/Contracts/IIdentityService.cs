using Application.DTOs.User;
using Application.Features.User.Commands.Register;
using Domain.Common.Response;

namespace Application.Contracts
{
    public interface IIdentityService
    {
        Task<Result<UserIdentityDto>> CreateUserAsync(
            RegisterCommand command,
            CancellationToken cancellationToken = default);
        Task<Result<UserIdentityDto>> CreateExternalUserAsync(ExternalAuthCommand command);
        Task<Result> AssignRoleAsync(string userId, string roleName, CancellationToken cancellationToken = default);
        Task<string> GenerateEmailConfirmationTokenAsync(string userId, CancellationToken cancellationToken = default);
        Task<Result<string>> ConfirmEmailAsync(string userId, string token, CancellationToken cancellationToken = default);
        Task<Result<bool>> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken = default);
        Task<Result<string>> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default);
        Task<bool> HasLoginAsync(string userId, string loginProvider);
        Task AddLoginAsync(string userId, string loginProvider, string providerKey);
        Task<List<string>> GetRolesAsync(string userId);
        Task UpdateRefreshTokenAsync(string userId, string refreshToken);
        Task<(bool IsAuthenticated, UserIdentityDto? User)> AuthenticateUserAsync(string email, string password);
        Task<UserIdentityDto?> GetUserByEmailAndValidateRefreshTokenAsync(string email, string refreshToken);

        Task<Result> RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default);
        Task<Result> AssignStaffRoleAsync(string userId, string position, CancellationToken cancellationToken = default);
        Task<Result> DemoteToCustomerAsync(string userId, CancellationToken cancellationToken = default);
    }
}
