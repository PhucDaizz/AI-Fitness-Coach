using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.UpdateInfor
{
    public class UpdateInforCommand: IRequest<Result<string>>
    {
        public string UserId { get; init; }
        public bool? Gender { get; init; }
        public string? Address { get; init; }
        public string? PhoneNumber { get; init; }
    }
}
