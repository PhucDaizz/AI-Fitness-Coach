using Application.Common.Interfaces;
using Application.Contracts;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Features.User.Commands.ForgotPassword
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
    {
        private readonly IIdentityService _identityService;
        private readonly IEmailServices _emailServices;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ForgotPasswordCommandHandler> _logger;

        public ForgotPasswordCommandHandler(IIdentityService identityService, IEmailServices emailServices, IUnitOfWork unitOfWork, ILogger<ForgotPasswordCommandHandler> logger)
        {
            _identityService = identityService;
            _emailServices = emailServices;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Auth.GetUserByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                _logger.LogInformation("Password reset requested for non-existent email: {Email}", request.Email);
                return Result.Success("If an account exists, a password reset link has been sent");
            }

            if (!user.EmailConfirmed)
            {
                return Result.Failure<string>(new Error("EMAIL.NOT_CONFIRMED",
                    "Please confirm your email before resetting password"));
            }

            var tokenResult = await _identityService.GeneratePasswordResetTokenAsync(request.Email, cancellationToken);
            if (tokenResult.IsFailure)
            {
                return Result.Failure<string>(tokenResult.Error);
            }

            var resetPasswordLink = _emailServices.GenerateResetPasswordLink(
                email: request.Email,
                token: tokenResult.Value,  
                clientUrl: request.ClientUrl);


            string subject = "Đặt lại mật khẩu - TravelNow";
            string htmlBody = _emailServices.CreateResetPasswordEmailBody( 
                userName: user.FullName ?? "Quý khách",
                resetLink: resetPasswordLink,
                expiryMinutes: 24);

            var emailSent = await _emailServices.SendEmailAsync(
                user.Email,
                subject,
                htmlBody,
                true,
                cancellationToken);

            if (emailSent)
            {
                _logger.LogInformation("Reset password email sent to: {Email}", user.Email);
                return Result.Success("Password reset link has been sent to your email");
            }
            else
            {
                _logger.LogError("Failed to send reset password email to: {Email}", user.Email);
                return Result.Failure<string>(new Error("EMAIL.SEND_FAILED",
                    "Failed to send reset password email. Please try again later."));
            }
        }
    }
}
