using Application.Contracts;
using Application.DTOs.User;
using Domain.Common;
using Domain.Common.Response;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Nexus.BuildingBlocks.Interfaces;
using RabbitMQ.Client;

namespace Application.Features.User.Commands.ExternalLogin
{
    public class ExternalLoginCommandHandler : IRequestHandler<ExternalLoginCommand, Result<LoginResponseDto>>
    {
        private readonly UserManager<ExtendedIdentityUser> _userManager;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IMessagePublisher _messagePublisher;

        public ExternalLoginCommandHandler(
            UserManager<ExtendedIdentityUser> userManager,
            ITokenGenerator tokenGenerator,
            IMessagePublisher messagePublisher)
        {
            _userManager = userManager;
            _tokenGenerator = tokenGenerator;
            _messagePublisher = messagePublisher;
        }

        public async Task<Result<LoginResponseDto>> Handle(ExternalLoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                user = new ExtendedIdentityUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    FullName = $"{request.LastName} {request.FirstName}".Trim(),
                    AvatarUrl = request.AvatarUrl,
                    EmailConfirmed = true, 
                    IsActive = true
                };

                var createResult = await _userManager.CreateAsync(user);

                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    return Result.Failure<LoginResponseDto>(new Error("USER.CREATE_FAILED", $"Lỗi tạo tài khoản: {errors}"));
                }

                await _userManager.AddToRoleAsync(user, AppRoles.Customer);

                await _userManager.AddLoginAsync(user, new UserLoginInfo(request.Provider, request.ProviderKey, request.Provider));

                await _messagePublisher.PublishAsync(
                    exchange: "user.events",
                    exchangeType: ExchangeType.Topic,
                    routingKey: "user.registered",
                    message: new SendEmailConfirmation
                    {
                        UserId = user.Id,
                        Email = request.Email,
                        FullName = $"{request.LastName} {request.FirstName}".Trim()
                });
            }
            else
            {
                var logins = await _userManager.GetLoginsAsync(user);
                var isGoogleLinked = logins.Any(l => l.LoginProvider == request.Provider && l.ProviderKey == request.ProviderKey);

                if (!isGoogleLinked)
                {
                    await _userManager.AddLoginAsync(user, new UserLoginInfo(request.Provider, request.ProviderKey, request.Provider));
                }
            }

            var roles = await _userManager.GetRolesAsync(user);

            var createTokenDto = new CreateTokenDTO
            {
                Email = user.Email,
                UserId = user.Id,
            };

            var accessToken = await _tokenGenerator.CreateToken(createTokenDto, roles.ToList());
            var refreshToken = _tokenGenerator.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(12); 

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                return Result.Failure<LoginResponseDto>(new Error("TOKEN.UPDATE_FAILED", "Không thể lưu Refresh Token."));
            }

            return Result.Success(new LoginResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken
            });
        }
    }
}
