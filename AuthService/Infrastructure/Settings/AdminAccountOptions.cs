namespace Infrastructure.Settings
{
    public class AdminAccountOptions
    {
        public const string SectionName = "AdminAccount"; 
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }
}
