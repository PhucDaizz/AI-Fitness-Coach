using Application.DTOs.User;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.RefreshToken
{
    public class RefreshTokenCommand: IRequest<Result<LoginResponseDto>>
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
