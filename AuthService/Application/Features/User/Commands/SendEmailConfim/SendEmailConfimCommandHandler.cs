using Application.Common.Interfaces;
using Application.Contracts;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.User.Commands.SendEmailConfim
{
    public class SendEmailConfimCommandHandler : IRequestHandler<SendEmailConfimCommand, Result<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IIdentityService _identityService;
        private readonly IEmailServices _emailServices;
        private readonly ILogger<SendEmailConfimCommandHandler> _logger;

        public SendEmailConfimCommandHandler(IUnitOfWork unitOfWork, IIdentityService identityService, IEmailServices emailServices, ILogger<SendEmailConfimCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _identityService = identityService;
            _emailServices = emailServices;
            _logger = logger;
        }

        public async Task<Result<string>> Handle(SendEmailConfimCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Auth.GetUserByIdAsync(request.UserId, cancellationToken);
            if (user is null)
            {
                return Result.Failure<string>(new Error("User.NotFound", "User is not existing"));
            }

            if (user.EmailConfirmed)
            {
                _logger.LogInformation("Email already confirmed for user: {UserId}", request.UserId);
                return Result.Success("Email already confirmed");
            }

            var token = await _identityService.GenerateEmailConfirmationTokenAsync(user.Id);

            var confirmationLink = _emailServices.GenerateConfirmationLink(user.Id, token);

            string subject = "Verify Email - KINETIC AI";
            string htmlBody = _emailServices.CreateConfirmationEmailBody(
                userName: user.FullName ?? "Quý khách",
                confirmationLink: confirmationLink);

            var emailSent = await _emailServices.SendEmailAsync(user.Email, subject, htmlBody, true);

            if (emailSent)
            {
                _logger.LogInformation("Confirmation email sent successfully to: {UserEmail}", user.Email);
            }
            else
            {
                _logger.LogWarning("Failed to send confirmation email to: {UserEmail}", user.Email);
            }

            return Result.Success("Confirmation email sent successfully");
        }
    }
}
