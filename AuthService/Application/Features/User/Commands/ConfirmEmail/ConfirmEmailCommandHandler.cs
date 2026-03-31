using Application.Contracts;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.ConfirmEmail
{
    public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, Result<string>>
    {
        private readonly IIdentityService _identityService;

        public ConfirmEmailCommandHandler(IIdentityService identityService)
        {
            _identityService = identityService;
        }

        public async Task<Result<string>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
        {
            var result = await _identityService.ConfirmEmailAsync(request.UserId, request.Token);
            return result;
        }
    }
}
