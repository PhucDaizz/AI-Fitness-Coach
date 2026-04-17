using Application.Common.Interfaces;
using Application.Contracts;
using Domain.Common.Response;
using Domain.Exceptions;
using MediatR;

namespace Application.Features.User.Commands.ChangePassword
{
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<bool>>
    {
        private readonly IIdentityService _identityService;
        private readonly ICurrentUserService _currentUserService;

        public ChangePasswordCommandHandler(
            IIdentityService identityService,
            ICurrentUserService currentUserService)
        {
            _identityService = identityService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<bool>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return Result.Failure<bool>(AuthErrors.Unauthorized);
            }

            var (success, message) = await _identityService.ChangePasswordAsync(
                userId,
                request.CurrentPassword,
                request.NewPassword);

            if (!success)
            {
                var error = message.Contains("current password")
                ? AuthErrors.InvalidCurrentPassword
                : AuthErrors.ChangePasswordFailed;

                return Result.Failure<bool>(new Error(error.Code, message));
            }

            return Result.Success<bool>(true);
        }
    }
}
