namespace AIService.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        string? UserName { get; }
        string? FullName { get; }
        string? PhoneNumber { get; }
        string? Email { get; }
        string? Role { get; }
        bool IsAuthenticated { get; }
    }
}
