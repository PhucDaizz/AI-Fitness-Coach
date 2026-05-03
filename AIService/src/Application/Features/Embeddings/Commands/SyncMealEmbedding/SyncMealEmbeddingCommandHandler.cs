using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using System.Security.Cryptography;
using System.Text;

namespace AIService.Application.Features.Embeddings.Commands.SyncMealEmbedding
{
    public class SyncMealEmbeddingCommandHandler : IRequestHandler<SyncMealEmbeddingCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IEmbeddingService _embeddingService;
        private readonly VectorStoreCollection<Guid, MealVectorRecord> _mealVectors;
        private readonly ILogger<SyncMealEmbeddingCommandHandler> _logger;

        public SyncMealEmbeddingCommandHandler(
            IApplicationDbContext context,
            IEmbeddingService embeddingService,
            VectorStoreCollection<Guid, MealVectorRecord> mealVectors,
            ILogger<SyncMealEmbeddingCommandHandler> logger)
        {
            _context = context;
            _embeddingService = embeddingService;
            _mealVectors = mealVectors;
            _logger = logger;
        }

        public async Task<bool> Handle(SyncMealEmbeddingCommand request, CancellationToken cancellationToken)
        {
            var meal = await _context.Meals
                .FirstOrDefaultAsync(m => m.Id == request.MealId, cancellationToken);

            if (meal == null)
            {
                _logger.LogWarning("[SyncEmbedding] Món ăn không tồn tại: {Id}", request.MealId);
                return false;
            }

            try
            {
                await _mealVectors.EnsureCollectionExistsAsync(cancellationToken);

                string payloadText = GenerateTextForAI(meal);

                var vectorArray = await _embeddingService.GenerateEmbeddingAsync(payloadText, cancellationToken);

                if (vectorArray == null || vectorArray.Length == 0)
                {
                    _logger.LogWarning("[SyncEmbedding] Vector rỗng cho món: {Name}", meal.Name);
                    return false;
                }

                var qdrantId = new Guid(MD5.HashData(Encoding.UTF8.GetBytes($"meal:{meal.Id}")));

                var record = new MealVectorRecord
                {
                    Id = qdrantId,
                    Vector = new ReadOnlyMemory<float>(vectorArray),
                    MealId = meal.Id,
                    Name = meal.Name,
                    Calories = meal.Calories,
                    Protein = meal.Protein,
                    Carbs = meal.Carbs,
                    Fat = meal.Fat,
                    CuisineType = meal.CuisineType ?? "General",
                    DietTags = meal.DietTags ?? new List<string>(),
                    HasImage = !string.IsNullOrEmpty(meal.ImageUrl),
                    ImageUrl = meal.ImageUrl ?? "",
                    EmbedVersion = 1, 
                    EmbeddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                };

                await _mealVectors.UpsertAsync(record, cancellationToken: cancellationToken);

                meal.UpdateEmbedStatus(EmbedStatus.embedded);
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation($"[SyncEmbedding] Hoàn tất nhúng lại Món ăn: {meal.Name}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[SyncEmbedding] Lỗi khi xử lý Món ăn {meal.Name}");
                throw;
            }
        }

        private string GenerateTextForAI(Domain.Entities.Meal meal)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Meal: {meal.Name}.");

            if (!string.IsNullOrWhiteSpace(meal.CuisineType))
                sb.AppendLine($"Cuisine type: {meal.CuisineType}.");

            if (meal.DietTags != null && meal.DietTags.Any())
                sb.AppendLine($"Dietary tags: {string.Join(", ", meal.DietTags)}.");

            var calorieLabel = meal.Calories switch
            {
                < 300 => "low-calorie (ít calo)",
                < 600 => "moderate-calorie (calo vừa phải)",
                < 900 => "high-calorie (nhiều calo)",
                _ => "very high-calorie (rất nhiều calo)"
            };

            var proteinLabel = meal.Protein switch
            {
                < 10 => "low protein (ít đạm)",
                < 25 => "moderate protein (đạm vừa)",
                _ => "high protein (giàu đạm)"
            };

            var carbLabel = meal.Carbs switch
            {
                < 20 => "low-carb (ít tinh bột, keto-friendly)",
                < 50 => "moderate-carb (tinh bột vừa)",
                _ => "high-carb (nhiều tinh bột)"
            };

            var fatLabel = meal.Fat switch
            {
                < 10 => "low-fat (ít béo)",
                < 25 => "moderate-fat (béo vừa phải)",
                _ => "high-fat (nhiều chất béo)"
            };

            sb.AppendLine($"Nutrition: {meal.Calories} kcal ({calorieLabel}), " +
                  $"{meal.Protein}g protein ({proteinLabel}), " +
                  $"{meal.Carbs}g carbs ({carbLabel}), " +
                  $"{meal.Fat}g fat ({fatLabel}).");

            if (!string.IsNullOrWhiteSpace(meal.Description))
                sb.AppendLine($"Mô tả: {meal.Description.Trim()}");

            return sb.ToString().Trim();
        }
    }
}
