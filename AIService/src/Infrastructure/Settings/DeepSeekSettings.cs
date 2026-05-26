namespace AIService.Infrastructure.Settings
{
    public sealed class DeepSeekSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "deepseek-v4-flash";
    }
}
