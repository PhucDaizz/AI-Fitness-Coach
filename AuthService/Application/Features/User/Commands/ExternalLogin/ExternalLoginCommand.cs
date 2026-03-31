using Domain.Common.Response;
using Application.DTOs.User;
using MediatR;

namespace Application.Features.User.Commands.ExternalLogin
{
    public class ExternalLoginCommand : IRequest<Result<LoginResponseDto>>
    {
        public string Email { get; set; }
        public string Provider { get; set; }
        public string ProviderKey { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
