using Application.DTOs.User;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.Login
{
    public class LoginCommand: IRequest<Result<LoginResponseDto>>
    {
        public string Email { get; set; }

        public string Password { get; set; }
    }
}
