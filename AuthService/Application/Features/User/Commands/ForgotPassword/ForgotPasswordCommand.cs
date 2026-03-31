using Domain.Common.Response;
using MediatR;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.User.Commands.ForgotPassword
{
    public class ForgotPasswordCommand: IRequest<Result<string>>
    {
        [EmailAddress]
        [Required]
        public string Email { get; init; }

        [Required]
        public string ClientUrl { get; init; }
    }
}
