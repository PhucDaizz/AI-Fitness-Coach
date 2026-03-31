namespace Infrastructure.Settings
{
    public class FrontendSettings
    {
        public const string SectionName = "Frontend";
        public string BaseUrl { get; set; } = string.Empty;
        public string ResetPasswordUrl { get; set; } = string.Empty;
    }
}
