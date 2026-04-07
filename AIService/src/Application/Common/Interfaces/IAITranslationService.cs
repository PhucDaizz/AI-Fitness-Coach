namespace AIService.Application.Common.Interfaces
{
    public interface IAITranslationService
    {
        Task<string> TranslateVietnameseToEnglishAsync(string text, CancellationToken ct = default);
    }
}
