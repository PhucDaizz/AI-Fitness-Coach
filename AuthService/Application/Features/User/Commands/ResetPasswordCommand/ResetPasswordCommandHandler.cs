using Application.Contracts;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.ResetPasswordCommand
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
    {
        private readonly IIdentityService _identityService;

        public ResetPasswordCommandHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var result = await _identityService.ResetPasswordAsync(
                request.Email!,
                request.Token!,
                request.Password!,
                cancellationToken);

            if (result.IsFailure)
            {
                return Result.Failure<string>(result.Error);
            }

            return Result.Success("Password has been reset successfully");
        }
    }
}
