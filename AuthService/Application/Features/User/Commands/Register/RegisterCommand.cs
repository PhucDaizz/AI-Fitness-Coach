using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.Register
{
    public class RegisterCommand: IRequest<Result<string>>
    {
        public string FullName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
