namespace Application.Contracts
{
    public interface IEmailServices
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isBodyHTML = true, CancellationToken cancellationToken = default);
        string CreateConfirmationEmailBody(string userName, string confirmationLink);
        string CreateResetPasswordEmailBody(string userName, string resetLink, int expiryMinutes = 30);
        string GenerateConfirmationLink(string userId, string token);
        string GenerateResetPasswordLink(string email, string token, string clientUrl = null);
    }
}