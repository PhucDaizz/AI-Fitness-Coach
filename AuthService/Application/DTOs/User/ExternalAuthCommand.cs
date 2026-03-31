namespace Application.DTOs.User
{
    public class ExternalAuthCommand
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Provider { get; set; } 
        public string ProviderKey { get; set; }
        public string AvatarUrl { get; init; } = string.Empty;
    }
}
