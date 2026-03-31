using Application.Common.Interfaces;
using Application.Contracts;
using Application.DTOs.User;
using Application.Repositories;
using Domain.Common;

namespace Infrastructure.Services
{
    public class ExternalAuthService : IExternalAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;

        public ExternalAuthService(IAuthRepository authRepository, ITokenGenerator tokenGenerator, IUnitOfWork unitOfWork, IIdentityService identityService)
        {
            _authRepository = authRepository;
            _tokenGenerator = tokenGenerator;
            _unitOfWork = unitOfWork;
            _identityService = identityService;
        }

        public async Task<AuthOAuthResultDto> AuthenticateAsync(ExternalAuthCommand command)
        {
            var userIdentity = await _authRepository.FindByEmailAsync(command.Email);
            bool isNewUser = false;

            // 2. Nếu chưa có, tạo mới
            if (userIdentity == null)
            {
                var newUser = await _identityService.CreateExternalUserAsync(command); // Không có password
                if (!newUser.IsSuccess)
                {
                    return new AuthOAuthResultDto { IsSuccess = false, ErrorMessage = string.Join(", ", newUser.Error.Message) };
                }
                userIdentity = newUser.Value;
                isNewUser = true;
            }

            // 3. Gán role nếu là user mới
            if (isNewUser)
            {
                await _identityService.AssignRoleAsync(userIdentity.Id, AppRoles.Customer);
            }

            // 4. Thêm thông tin đăng nhập ngoài (Google)
            var hasLogin = await _identityService.HasLoginAsync(userIdentity.Id, command.Provider);
            if (!hasLogin)
            {
                await _identityService.AddLoginAsync(userIdentity.Id, command.Provider, command.ProviderKey);
            }

            // 5. Tạo JWT và Refresh Token
            var crateUserToken = new CreateTokenDTO
            {
                Email = userIdentity.Email,
                UserId = userIdentity.Id,
            };
            var roles = await _identityService.GetRolesAsync(userIdentity.Id);

            var accessToken = await _tokenGenerator.CreateToken(crateUserToken, roles);
            var refreshToken = _tokenGenerator.GenerateRefreshToken();


            await _identityService.UpdateRefreshTokenAsync(userIdentity.Id, refreshToken);

            await _unitOfWork.SaveChangesAsync();

            return new AuthOAuthResultDto
            {
                IsSuccess = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Roles = roles,
                UserId = userIdentity.Id,
                FullName = command.FirstName + " " + command.LastName
            };
        }
    }
}
