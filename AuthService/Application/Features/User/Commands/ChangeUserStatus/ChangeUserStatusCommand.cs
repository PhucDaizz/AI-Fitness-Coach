using MediatR;
using Domain.Common.Response;

namespace Application.Features.User.Commands.ChangeUserStatus
{
    public class ChangeUserStatusCommand : IRequest<Result<bool>>
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
