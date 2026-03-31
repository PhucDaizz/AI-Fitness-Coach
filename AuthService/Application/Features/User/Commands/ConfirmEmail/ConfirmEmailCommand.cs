using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.ConfirmEmail
{
    public class ConfirmEmailCommand: IRequest<Result<string>>
    {
        public string UserId { get; init; }
        public string Token { get; init; }
    }
}
