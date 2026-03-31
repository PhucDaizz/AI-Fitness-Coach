using Application.DTOs.User;


namespace Application.Contracts
{
    public interface IExternalAuthService
    {
        Task<AuthOAuthResultDto> AuthenticateAsync(ExternalAuthCommand command);
    }
}
