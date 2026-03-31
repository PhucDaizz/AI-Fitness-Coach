using Application.Common.Interfaces;
using Application.Contracts;
using Application.DTOs.User;
using Domain.Common.Response;
using MediatR;
using System.Security.Claims;

namespace Application.Features.User.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<LoginResponseDto>>
    {
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IIdentityService _identityService;
        private readonly IUnitOfWork _unitOfWork;

        public RefreshTokenCommandHandler(ITokenGenerator tokenGenerator, IIdentityService identityService, IUnitOfWork unitOfWork)
        {
            _tokenGenerator = tokenGenerator;
            _identityService = identityService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<LoginResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var principal = _tokenGenerator.GetPrincipalFromExpiredToken(request.Token);
            var email = principal?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Result.Failure<LoginResponseDto>(new Error("Invalid token", "The refresh token is invalid or has expired."));
            }

            var user = await _identityService.GetUserByEmailAndValidateRefreshTokenAsync(email, request.RefreshToken);
            if (user == null)
            {
                return new LoginResponseDto();
            }

            var roles = await _identityService.GetRolesAsync(user.Id);
            var createTokenDto = new CreateTokenDTO
            {
                Email = user.Email,
                UserId = user.Id,
            };
            var newAccessToken = await _tokenGenerator.CreateToken(createTokenDto, roles);
            var newRefreshToken = _tokenGenerator.GenerateRefreshToken();

            await _identityService.UpdateRefreshTokenAsync(user.Id, newRefreshToken);
            await _unitOfWork.SaveChangesAsync();

            return Result.Success(new LoginResponseDto
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
            });
        }
    }
}
