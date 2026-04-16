namespace AIService.Application.Common.Interfaces
{
    public interface ITitleGeneratorAiService
    {
        Task<string> GenerateTitleAsync(string firstMessage, CancellationToken cancellationToken = default);
    }
}
