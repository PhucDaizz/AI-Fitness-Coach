namespace AIService.Infrastructure.Settings
{
    public class GoogleSettings
    {
        public string Model { get; set; } = "gemma-4-31b-it";
        public string TranslatorModel { get; set; } = "gemma-4-31b-it";
        public string ApiKey { get; set; } = string.Empty;
    }
}
