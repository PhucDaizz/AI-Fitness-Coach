namespace Application.DTOs.User
{
    public class InforDto
    {
        public string UserName { get; init; }
        public string FullName { get; init; }
        public string AvatarUrl { get; init; }
        public string Email { get; init; }
        public bool? EmailConfirmed { get; init; }
        public string? PhoneNumber { get; init; }
        public string? Address { get; init; }
        public bool? Gender { get; init; }
    }
}
