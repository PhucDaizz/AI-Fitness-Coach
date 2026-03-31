using Application.Contracts;
using Application.DTOs.User;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.User.EventHandlers
{
    public class SendEmailConfirmationEventHandler : INotificationHandler<SendEmailConfirmation>
    {
        private readonly IEmailServices _emailServices;
        private readonly IIdentityService _identityService;
        private readonly ILogger<SendEmailConfirmationEventHandler> _logger;

        public SendEmailConfirmationEventHandler(
            IEmailServices emailServices,
            IIdentityService identityService,
            ILogger<SendEmailConfirmationEventHandler> logger)
        {
            _emailServices = emailServices;
            _identityService = identityService;
            _logger = logger;
        }

        public async Task Handle(SendEmailConfirmation notification, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Processing email confirmation for user: {UserId}", notification.UserId);

                var token = await _identityService.GenerateEmailConfirmationTokenAsync(notification.UserId, cancellationToken);

                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(notification.Email))
                {
                    _logger.LogWarning("Failed to generate confirmation token for user: {UserId}", notification.UserId);
                    return;
                }

                var confirmationLink = _emailServices.GenerateConfirmationLink(notification.UserId, token);

                string subject = "Xác nhận tài khoản - Doris";
                string htmlBody = _emailServices.CreateConfirmationEmailBody(
                    userName: notification.FullName ?? "Quý khách",
                    confirmationLink: confirmationLink);

                var emailSent = await _emailServices.SendEmailAsync(notification.Email, subject, htmlBody, true);

                if (emailSent)
                {
                    _logger.LogInformation("Confirmation email sent successfully to: {UserEmail}", notification.Email);
                }
                else
                {
                    _logger.LogWarning("Failed to send confirmation email to: {UserEmail}", notification.Email);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending confirmation email for user: {UserId}", notification.UserId);
            }
        }
    }
}