using Application.Contracts;
using Application.DTOs.User;
using Application.Features.User.Commands.Register;
using Domain.Common;
using Domain.Common.Response;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using System.Text;

namespace Infrastructure.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ExtendedIdentityUser> _userManager;
        private readonly ILogger<IdentityService> _logger;

        public IdentityService(
            UserManager<ExtendedIdentityUser> userManager,
            ILogger<IdentityService> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        
        public async Task<Result> AssignRoleAsync(
            string userId,
            string roleName,
            CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Result.Failure(new Error("User.NotFound", "User not found"));
            }

            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (!result.Succeeded)
            {
                return Result.Failure(new Error("Role.AssignFailed",
                    string.Join("; ", result.Errors.Select(e => e.Description))));
            }

            return Result.Success();
        }

        public async Task<string> GenerateEmailConfirmationTokenAsync(
            string userId,
            CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return string.Empty;
            }

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            return Convert.ToBase64String(Encoding.UTF8.GetBytes(token));
        }

        public async Task<Result<string>> ConfirmEmailAsync(
            string userId,
            string token,
            CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure<string>(new Error("User.NotFound", "User not found"));
            }

            if(user.EmailConfirmed)
            {
                return Result.Success("Email already confirmed");
            }

            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
            if (!result.Succeeded)
            {
                return Result.Failure<string>(new Error("Email.ConfirmFailed",
                string.Join("; ", result.Errors.Select(e => e.Description))));
            }

            return Result.Success("Email has been confirm");
        }

        public async Task<Result<bool>> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return Result.Failure<bool>(new Error("USER.NOTFOUND","User is not existing"));
            }

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, newPassword);

                if (result.Succeeded)
                {
                    return Result.Success(true);
                }
                return Result.Failure<bool>(new Error("USER.NOTFOUND", result.Errors.Select(e => e.Description).First())); 
            }
            catch (FormatException)
            {
                return Result.Failure<bool>(new Error("TOKEN.INVALIDFORMAT","Invalid token format."));
            }
        }

        public async Task<Result<string>> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return Result.Failure<string>(new Error("USER.NOTFOUND","User is not existing"));
            }
            var tokenReset =  await _userManager.GeneratePasswordResetTokenAsync(user);
            return Result.Success(tokenReset);
        }

        public async Task<bool> HasLoginAsync(string userId, string loginProvider)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            var logins = await _userManager.GetLoginsAsync(user);
            return logins.Any(l => l.LoginProvider == loginProvider);
        }

        public async Task AddLoginAsync(string userId, string loginProvider, string providerKey)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                await _userManager.AddLoginAsync(user, new UserLoginInfo(loginProvider, providerKey, loginProvider));
            }
        }

        public async Task<List<string>> GetRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return new List<string>();

            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToList();
        }

        public async Task UpdateRefreshTokenAsync(string userId, string refreshToken)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(12);
                await _userManager.UpdateAsync(user);
            }
        }

        public async Task<Result<UserIdentityDto>> CreateUserAsync(RegisterCommand command, CancellationToken cancellationToken = default)
        {
            var user = new ExtendedIdentityUser
            {
                UserName = command.Email.Trim(),
                FullName = command.FullName.Trim(),
                Email = command.Email.Trim(),
                PhoneNumber = command.PhoneNumber?.Trim(),
            };

            var result = await _userManager.CreateAsync(user, command.Password);

            if (result.Succeeded)
            {
                var userDto = new UserIdentityDto
                {
                    Id = user.Id,
                    Email = user.Email
                };
                return Result.Success(userDto);
            }
            else
            {
                var errors = result.Errors
                    .Select(e => new Error($"Identity.{e.Code}", e.Description))
                    .ToList();

                _logger.LogWarning(
                    "Failed to create user {Email}: {Errors}",
                    command.Email,
                    string.Join(", ", errors.Select(e => e.Message))
                );

                if (errors.Count == 1)
                {
                    return Result.Failure<UserIdentityDto>(errors[0]);
                }

                return Result.Failure<UserIdentityDto>(
                    new Error(
                        "Identity.MultipleErrors",
                        string.Join("; ", errors.Select(e => e.Message))
                    )
                );
            }
        }

        public async Task<Result<UserIdentityDto>> CreateExternalUserAsync(ExternalAuthCommand command)
        {
            var newUser = new ExtendedIdentityUser
            {
                UserName = command.Email,
                Email = command.Email,
                EmailConfirmed = true,
                FullName = $"{command.FirstName} {command.LastName}"
            };

            var result = await _userManager.CreateAsync(newUser);

            if (!result.Succeeded)
            {
                var error = result.Errors.Count() == 1
                    ? new Error(
                        $"Identity.{result.Errors.First().Code}",
                        result.Errors.First().Description)
                    : new Error(
                        "Identity.MultipleErrors",
                        string.Join("; ", result.Errors.Select(e => e.Description))
                    );

                return Result.Failure<UserIdentityDto>(error);
            }

            var createdUserDto = new UserIdentityDto { Id = newUser.Id, Email = newUser.Email };
            return Result.Success(createdUserDto);
        }

        public async Task<(bool IsAuthenticated, UserIdentityDto? User)> AuthenticateUserAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return (false, null);
            }

            var isPasswordCorrect = await _userManager.CheckPasswordAsync(user, password);
            if (!isPasswordCorrect)
            {
                return (false, null);
            }

            var userDto = new UserIdentityDto
            {
                Id = user.Id,
                Email = user.Email
            };

            return (true, userDto);
        }

        public async Task<UserIdentityDto?> GetUserByEmailAndValidateRefreshTokenAsync(string email, string refreshToken)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiry < DateTime.UtcNow)
            {
                return null; 
            }

            return new UserIdentityDto { Id = user.Id, Email = user.Email };
        }

        public async Task<Result> RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Result.Failure(new Error("USER.NOT_FOUND", "User not found"));

                var result = await _userManager.RemoveFromRoleAsync(user, role);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Removed role {Role} from user {UserId}", role, userId);
                    return Result.Success($"Removed role: {role}");
                }

                return Result.Failure(new Error("ROLE.REMOVE_FAILED",
                    string.Join(", ", result.Errors.Select(e => e.Description))));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing role {Role} from user {UserId}", role, userId);
                return Result.Failure(new Error("ROLE.REMOVE_ERROR", ex.Message));
            }
        }

        public async Task<Result> AssignStaffRoleAsync(string userId, string position, CancellationToken cancellationToken = default)
        {
            var (role, isValid) = MapPositionToRole(position);
            if (!isValid)
                return Result.Failure(new Error("INVALID.POSITION", $"Invalid position: {position}"));

            return await AssignRoleAsync(userId, role, cancellationToken);
        }

        public async Task<Result> DemoteToCustomerAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Result.Failure(new Error("USER.NOT_FOUND", "User not found"));

            // Get current roles
            var currentRoles = await _userManager.GetRolesAsync(user);

            // Remove all staff roles
            var staffRoles = currentRoles.Where(r => r != AppRoles.Customer).ToList();

            foreach (var role in staffRoles)
            {
                await _userManager.RemoveFromRoleAsync(user, role);
            }

            // Add customer role if not already
            if (!currentRoles.Contains(AppRoles.Customer))
            {
                await _userManager.AddToRoleAsync(user, AppRoles.Customer);
            }

            _logger.LogInformation("User {UserId} demoted to Customer role", userId);
            return Result.Success("User demoted to Customer");
        }

        private (string role, bool isValid) MapPositionToRole(string position)
        {
            return position.ToLower() switch
            {
                "sysadmin" or "admin" => (AppRoles.SysAdmin, true),
                _ => (string.Empty, false)
            };
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(
            string userId,
            string currentPassword,
            string newPassword)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"User {userId} not found when changing password");
                    return (false, "User not found");
                }

                var isPasswordValid = await _userManager.CheckPasswordAsync(user, currentPassword);
                if (!isPasswordValid)
                {
                    _logger.LogWarning($"Invalid current password for user {userId}");
                    return (false, "Current password is incorrect");
                }

                var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    _logger.LogWarning($"Change password failed for user {userId}: {errors}");
                    return (false, $"Failed to change password: {errors}");
                }

                await _userManager.UpdateAsync(user);

                _logger.LogInformation($"Password changed successfully for user {userId}");
                return (true, "Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error changing password for user {userId}");
                return (false, "An error occurred while changing the password");
            }
        }
    }
}
