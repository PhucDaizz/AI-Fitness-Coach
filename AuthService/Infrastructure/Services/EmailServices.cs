using Application.Contracts;
using Infrastructure.Settings;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace Infrastructure.Services
{
    public class EmailServices : IEmailServices
    {
        private readonly IOptions<EmailSettings> _emailSettings;
        private readonly IOptions<FrontendSettings> _frontendSettings;
        private readonly ILogger<EmailServices> _logger;

        public EmailServices(
            IOptions<EmailSettings> emailSettings,
            IOptions<FrontendSettings> frontendSettings,
            ILogger<EmailServices> logger)
        {
            _emailSettings = emailSettings;
            _frontendSettings = frontendSettings;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body, bool isBodyHTML = true, CancellationToken cancellationToken = default)
        {
            try
            {
                var settings = _emailSettings.Value;

                using var smtpClient = new SmtpClient(settings.MailServer, settings.MailPort)
                {
                    Credentials = new NetworkCredential(settings.FromEmail, settings.Password),
                    EnableSsl = settings.UseSsl
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(settings.FromEmail, settings.DisplayName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isBodyHTML
                };

                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage, cancellationToken);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
                return true;
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Email sending was cancelled for {Email}", toEmail);
                throw; 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                return false;
            }
        }

        public string CreateConfirmationEmailBody(string userName, string confirmationLink)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <title>Activate your KINETIC AI cockpit</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,700;14..32,800&display=swap');
                </style>
            </head>
            <body style=""margin:0; padding:0; background-color:#0e0e0e; font-family: 'Inter', Arial, sans-serif;"">
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#0e0e0e;"">
                    <tr>
                        <td align=""center"" style=""padding: 40px 20px;"">
                            <!-- Main card – tonal stacking -->
                            <table width=""100%"" max-width=""560"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""max-width:560px; width:100%; background-color:#1a1919; border-radius:24px;"">
                                <tr>
                                    <td style=""padding: 32px 32px 40px 32px;"">
                                        <!-- Header with editorial asymmetry -->
                                        <div style=""margin-bottom:32px;"">
                                            <span style=""font-size:12px; letter-spacing:0.05em; text-transform:uppercase; color:#6a9cff; font-weight:700;"">KINETIC AI // ONBOARDING</span>
                                            <h1 style=""font-size:28px; font-weight:800; letter-spacing:-0.02em; color:#ffffff; margin:12px 0 4px; line-height:1.2;"">Activate your<br>digital cockpit</h1>
                                            <p style=""font-size:14px; color:#adaaaa; margin-top:8px; line-height:1.5;"">One more step to unlock full performance metrics.</p>
                                        </div>

                                        <!-- Body -->
                                        <div style=""margin-bottom:32px;"">
                                            <p style=""font-size:16px; line-height:1.5; color:#e0e0e0; margin-bottom:24px;"">
                                                Hello <strong style=""color:#b1ff24;"">{userName}</strong>, verify your email address to access personalized training plans, AI coaching, and real‑time biometric sync.
                                            </p>

                                            <!-- CTA Button – primary neon, pill, no border -->
                                            <table cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:28px 0 32px; width:100%;"">
                                                <tr>
                                                    <td align=""center"" bgcolor=""#b1ff24"" style=""border-radius:100px; padding:12px 28px;"">
                                                        <a href=""{confirmationLink}"" style=""display:inline-block; color:#000000; text-decoration:none; font-weight:800; font-size:15px; letter-spacing:-0.2px;"">✓ VERIFY EMAIL →</a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Ghost panel -->
                                            <div style=""background-color:#262626; border-radius:16px; padding:20px; margin-top:24px;"">
                                                <p style=""font-size:13px; color:#6a9cff; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.03em;"">⚡ Security pulse</p>
                                                <p style=""font-size:14px; color:#ffffff; margin:0; line-height:1.4;"">
                                                    Once verified, the KINETIC AI coach will calibrate to your physiology.
                                                </p>
                                            </div>
                                        </div>

                                        <!-- Footer – tonal shift, no border -->
                                        <div style=""margin-top:32px; background-color:#000000; border-radius:16px; text-align:center; padding:20px 16px;"">
                                            <p style=""font-size:12px; color:#6a6a6a; margin:0 0 8px;"">KINETIC AI – The Obsidian Pulse</p>
                                            <p style=""font-size:11px; color:#4a4a4a; margin:0;"">This is an automated message from your digital cockpit.</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            ";
        }

        public string CreateResetPasswordEmailBody(string userName, string resetLink, int expiryMinutes = 60)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <title>Reset your KINETIC AI access key</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,700;14..32,800&display=swap');
                </style>
            </head>
            <body style=""margin:0; padding:0; background-color:#0e0e0e; font-family: 'Inter', Arial, sans-serif;"">
                <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background-color:#0e0e0e;"">
                    <tr>
                        <td align=""center"" style=""padding: 40px 20px;"">
                            <table width=""100%"" max-width=""560"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""max-width:560px; width:100%; background-color:#1a1919; border-radius:24px;"">
                                <tr>
                                    <td style=""padding: 32px 32px 40px 32px;"">
                                        <div style=""margin-bottom:32px;"">
                                            <span style=""font-size:12px; letter-spacing:0.05em; text-transform:uppercase; color:#b1ff24; font-weight:700;"">KINETIC AI // SECURITY</span>
                                            <h1 style=""font-size:28px; font-weight:800; letter-spacing:-0.02em; color:#ffffff; margin:12px 0 4px; line-height:1.2;"">Reset your<br>access key</h1>
                                            <p style=""font-size:14px; color:#adaaaa; margin-top:8px; line-height:1.5;"">A password reset was requested for your KINETIC AI account.</p>
                                        </div>

                                        <div style=""margin-bottom:32px;"">
                                            <p style=""font-size:16px; line-height:1.5; color:#e0e0e0; margin-bottom:24px;"">
                                                Hello <strong style=""color:#b1ff24;"">{userName}</strong>, to secure your cockpit, create a new authentication key using the button below.
                                            </p>

                                            <table cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:28px 0 32px; width:100%;"">
                                                <tr>
                                                    <td align=""center"" bgcolor=""#b1ff24"" style=""border-radius:100px; padding:12px 28px;"">
                                                        <a href=""{resetLink}"" style=""display:inline-block; color:#000000; text-decoration:none; font-weight:800; font-size:15px; letter-spacing:-0.2px;"">⟳ RESET PASSWORD →</a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <div style=""background-color:#262626; border-radius:16px; padding:20px; margin-top:24px;"">
                                                <p style=""font-size:13px; color:#6a9cff; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.03em;"">⏱️ Security pulse</p>
                                                <p style=""font-size:14px; color:#ffffff; margin:0; line-height:1.4;"">
                                                    This link will expire in <strong style=""color:#b1ff24;"">{expiryMinutes} minutes</strong>. If you didn't request this change, ignore this email.
                                                </p>
                                            </div>
                                        </div>

                                        <div style=""margin-top:32px; background-color:#000000; border-radius:16px; text-align:center; padding:20px 16px;"">
                                            <p style=""font-size:12px; color:#6a6a6a; margin:0 0 8px;"">KINETIC AI – The Obsidian Pulse</p>
                                            <p style=""font-size:11px; color:#4a4a4a; margin:0;"">Your digital cockpit, always secure.</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            ";
        }

        public string GenerateConfirmationLink(string userId, string token)
        {
            var frontendUrl = _frontendSettings.Value.BaseUrl;

            if (string.IsNullOrEmpty(frontendUrl))
            {
                throw new InvalidOperationException("Frontend URL is not configured");
            }

            var encodedToken = System.Web.HttpUtility.UrlEncode(token);
            var encodedUserId = System.Web.HttpUtility.UrlEncode(userId);

            return $"{frontendUrl}/verify-email?userId={encodedUserId}&token={encodedToken}";
        }

        public string GenerateResetPasswordLink(string email, string token, string clientUrl = null)
        {
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            if (string.IsNullOrEmpty(clientUrl))
            {
                clientUrl = _frontendSettings.Value.ResetPasswordUrl
                    ?? "http://localhost:5173/reset-password";
            }

            var queryParams = new Dictionary<string, string?>
            {
                ["token"] = encodedToken,
                ["email"] = email,
                ["expires"] = DateTime.UtcNow.AddMinutes(30).ToString("o") 
            };

            return QueryHelpers.AddQueryString(clientUrl, queryParams);
        }

    }
}