using Microsoft.Extensions.AI;
using AIService.Application.Common.Interfaces; 
using AIService.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore; 
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text;

namespace AIService.Application.Features.Search.Queries
{
    public record AskExerciseQuery(string Question) : IRequest<string>;

    public class AskExerciseQueryHandler : IRequestHandler<AskExerciseQuery, string>
    {
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _exerciseVectors;
        private readonly ILogger<AskExerciseQueryHandler> _logger;
        private readonly IApplicationDbContext _context;

        private readonly IEmbeddingGenerator<string, Embedding<float>> _embeddingService;
        private readonly IChatCompletionService _translatorAi;
        private readonly IChatCompletionService _ptAi;

        public AskExerciseQueryHandler(
            VectorStoreCollection<Guid, ExerciseVectorRecord> exerciseVectors,
            Kernel kernel, 
            ILogger<AskExerciseQueryHandler> logger,
            IApplicationDbContext context,
            IEmbeddingGenerator<string, Embedding<float>> embeddingService)
        {
            _exerciseVectors = exerciseVectors;
            _logger = logger;
            _context = context;
            _embeddingService = embeddingService;
            _translatorAi = kernel.GetRequiredService<IChatCompletionService>("fast_translator");
            _ptAi = kernel.GetRequiredService<IChatCompletionService>("pt_brain");
        }

        public async Task<string> Handle(AskExerciseQuery request, CancellationToken cancellationToken)
        {
            var translateHistory = new ChatHistory(
                "You are an expert translator. Translate the following fitness/anatomy query from Vietnamese to English. " +
                "CRITICAL RULES: ONLY output the translated English text. DO NOT add explanations, notes, or quotes."
            );
            translateHistory.AddUserMessage(request.Question);

            var executionSettings = new PromptExecutionSettings
            {
                ExtensionData = new Dictionary<string, object> { { "max_tokens", 30 } }
            };

            var translatedResult = await _translatorAi.GetChatMessageContentAsync(
                translateHistory,
                executionSettings, 
                cancellationToken: cancellationToken);

            var translatedQuery = translatedResult.Content?.Trim() ?? request.Question;
            _logger.LogInformation($"[AI Translator] Gốc: {request.Question} -> Dịch: {translatedQuery}");

            var queryVector = await _embeddingService.GenerateVectorAsync(
                translatedQuery, cancellationToken: cancellationToken);

            var searchResults = _exerciseVectors.SearchAsync(
                queryVector,
                top: 5,
                new VectorSearchOptions<ExerciseVectorRecord>
                {
                    IncludeVectors = false,   
                },
                cancellationToken: cancellationToken);

            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine("RETRIEVED EXERCISES CONTEXT:");
            contextBuilder.AppendLine("---");

            await foreach (var result in searchResults)
            {
                if (result.Score < 0.4) continue;

                var item = result.Record;

                var dbExercise = await _context.Exercises
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == item.ExerciseId, cancellationToken);

                var description = dbExercise?.Description ?? "No description.";

                contextBuilder.AppendLine($"### Exercise Name: {item.Name}");
                contextBuilder.AppendLine($"- Description: {description}");

                var categoryStr = string.IsNullOrEmpty(item.CategoryVN) ? item.Category : $"{item.CategoryVN} ({item.Category})";
                contextBuilder.AppendLine($"- Category: {categoryStr}");

                contextBuilder.AppendLine($"- Primary Muscles: {string.Join(", ", item.PrimaryMuscles)}");

                if (item.SecondaryMuscles.Any())
                {
                    contextBuilder.AppendLine($"- Secondary Muscles: {string.Join(", ", item.SecondaryMuscles)}");
                }

                contextBuilder.AppendLine($"- Equipment: {(item.IsBodyweight ? "Bodyweight only" : string.Join(", ", item.Equipments))}");

                if (item.LocationTypes.Any())
                {
                    contextBuilder.AppendLine($"- Location: {string.Join(", ", item.LocationTypes)}");
                }

                if (item.HasImage && !string.IsNullOrEmpty(item.ImageUrl))
                {
                    contextBuilder.AppendLine($"- Image URL: {item.ImageUrl}");
                }

                contextBuilder.AppendLine($"*(Match Score: {result.Score:F2})*");
                contextBuilder.AppendLine("---");
            }

            if (contextBuilder.Length < 100)
                return "Xin lỗi, hiện tại tôi không tìm thấy bài tập nào phù hợp với yêu cầu của bạn trong thư viện.";


            var chatHistory = new ChatHistory(
            @"You are a professional Personal Trainer. Based STRICTLY on the provided Context, answer the user's query.

            CRITICAL RULES:
            1. ONLY recommend exercises present in the Context. Do NOT invent or hallucinate exercises.
            2. If the user mentions pain, injury, or medical conditions, advise them to consult a doctor.
            3. Format using Markdown (bold, italics, bullet points).
            4. If an 'Image URL' is provided, embed it using Markdown: ![exercise name](Image URL).
            5. YOU MUST REPLY ENTIRELY IN VIETNAMESE in a friendly, encouraging tone.");

            chatHistory.AddUserMessage($"{contextBuilder}\n\nUser's Question: {request.Question}");

            var response = await _ptAi.GetChatMessageContentAsync(
                chatHistory, cancellationToken: cancellationToken);

            return response.Content ?? "Có lỗi xảy ra khi gọi AI.";
        }
    }
}