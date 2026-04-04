using AIService.Application.Common.Interfaces; 
using AIService.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore; 
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Embeddings;
using System.Text;

namespace AIService.Application.Features.Search.Queries
{
    public record AskExerciseQuery(string Question) : IRequest<string>;

    public class AskExerciseQueryHandler : IRequestHandler<AskExerciseQuery, string>
    {
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _exerciseVectors;
        private readonly ILogger<AskExerciseQueryHandler> _logger;
        private readonly ITextEmbeddingGenerationService _embeddingService;
        private readonly IChatCompletionService _chatService;

        private readonly IApplicationDbContext _context;

        public AskExerciseQueryHandler(
            VectorStoreCollection<Guid, ExerciseVectorRecord> exerciseVectors,
            Kernel kernel,
            ILogger<AskExerciseQueryHandler> logger,
            IApplicationDbContext context)
        {
            _exerciseVectors = exerciseVectors;
            _logger = logger;
            _embeddingService = kernel.GetRequiredService<ITextEmbeddingGenerationService>();
            _chatService = kernel.GetRequiredService<IChatCompletionService>();
            _context = context;
        }

        public async Task<string> Handle(AskExerciseQuery request, CancellationToken cancellationToken)
        {
            var queryVector = await _embeddingService.GenerateEmbeddingAsync(
                request.Question, cancellationToken: cancellationToken);

            var searchResults = _exerciseVectors.SearchAsync(
                queryVector,
                top: 5,
                new VectorSearchOptions<ExerciseVectorRecord>
                {
                    IncludeVectors = false,   
                },
                cancellationToken: cancellationToken);

            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine("DANH SÁCH BÀI TẬP TÌM THẤY TRONG CƠ SỞ DỮ LIỆU:");
            contextBuilder.AppendLine("---");

            await foreach (var result in searchResults) 
            {
                if (result.Score < 0.4) continue;

                var item = result.Record;

                var dbExercise = await _context.Exercises
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == item.ExerciseId, cancellationToken);

                var description = dbExercise?.Description ?? "Không có mô tả chi tiết.";

                contextBuilder.AppendLine($"### Tên bài tập: {item.Name}");

                contextBuilder.AppendLine($"- Mô tả cách tập: {description}");

                var categoryStr = string.IsNullOrEmpty(item.CategoryVN) ? item.Category : $"{item.CategoryVN} ({item.Category})";
                contextBuilder.AppendLine($"- Phân loại: {categoryStr}");

                contextBuilder.AppendLine($"- Cơ tác động chính: {string.Join(", ", item.PrimaryMuscles)}");

                if (item.SecondaryMuscles.Any())
                {
                    contextBuilder.AppendLine($"- Cơ tham gia phụ: {string.Join(", ", item.SecondaryMuscles)}");
                }

                contextBuilder.AppendLine($"- Dụng cụ yêu cầu: {(item.IsBodyweight ? "Không cần (Bodyweight)" : string.Join(", ", item.Equipments))}");

                if (item.LocationTypes.Any())
                {
                    contextBuilder.AppendLine($"- Môi trường phù hợp: {string.Join(", ", item.LocationTypes)}");
                }

                if (item.HasImage && !string.IsNullOrEmpty(item.ImageUrl))
                {
                    contextBuilder.AppendLine($"- Link ảnh minh họa: {item.ImageUrl}");
                }

                contextBuilder.AppendLine($"*(Độ tương thích: {result.Score:F2})*");
                contextBuilder.AppendLine("---");
            }

            if (contextBuilder.Length < 100)
                return "Xin lỗi, hiện tại tôi không tìm thấy bài tập nào phù hợp với yêu cầu của bạn trong thư viện.";


            var chatHistory = new ChatHistory(
            @"Bạn là PT chuyên nghiệp. Dựa vào Context (danh sách bài tập) để trả lời:

            - Chỉ đề xuất bài tập có trong Context, không tự bịa thêm.
            - Nếu học viên nói về đau/ chấn thương/ bệnh lý → khuyên tham khảo bác sĩ.
            - Trình bày bằng Markdown (đậm, nghiêng, gạch đầu dòng).
            - Nếu có 'Link ảnh minh họa' → chèn ảnh: ![tên bài tập](link)");

            chatHistory.AddUserMessage($"{contextBuilder}\n\nCâu hỏi của học viên: {request.Question}");

            var response = await _chatService.GetChatMessageContentAsync(
                chatHistory, cancellationToken: cancellationToken);

            return response.Content ?? "Có lỗi xảy ra khi gọi AI.";
        }
    }
}