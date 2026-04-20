using MediatR;
using Domain.Common.Response;

namespace Application.Features.User.Commands.ChangePassword
{
    public class ChangePasswordCommand : IRequest<Result<bool>>
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }
}
