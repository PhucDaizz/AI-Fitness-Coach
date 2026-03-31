using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.SendEmailConfim
{
    public class SendEmailConfimCommand: IRequest<Result<string>>
    {
        public string UserId { get; init; }
    }
}
