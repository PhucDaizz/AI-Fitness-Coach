using Application.Common.Interfaces;
using Application.Contracts;
using Application.DTOs.User;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponseDto>>
    {
        private readonly IIdentityService _identityService;
        private readonly ITokenGenerator _tokenGenerator;

        public LoginCommandHandler(IIdentityService identityService, ITokenGenerator tokenGenerator)
        {
            _identityService = identityService;
            _tokenGenerator = tokenGenerator;
        }

        public async Task<Result<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var (isAuthenticated, user) = await _identityService.AuthenticateUserAsync(request.Email, request.Password);
            if (!isAuthenticated) 
                return Result.Failure<LoginResponseDto>(new Error("InvalidCredentials", "The email or password provided is incorrect."));

            var roles = await _identityService.GetRolesAsync(user.Id);

            var createTokenDto = new CreateTokenDTO
            {
                Email = user.Email,
                UserId = user.Id,
            };
            var token = await _tokenGenerator.CreateToken(createTokenDto, roles);
            var refreshToken = _tokenGenerator.GenerateRefreshToken();
            await _identityService.UpdateRefreshTokenAsync(user.Id, refreshToken);

            return Result.Success(new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshToken
            });
        }
    }
}
