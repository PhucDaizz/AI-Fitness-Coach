namespace AIService.Infrastructure.Settings
{
    public class OpenRouterSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string TranslatorModel { get; set; } = "nvidia/nemotron-3-super-120b-a12b:free";
    }
}
