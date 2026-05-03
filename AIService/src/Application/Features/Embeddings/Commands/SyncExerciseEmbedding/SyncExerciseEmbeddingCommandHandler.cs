using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using System.Security.Cryptography;
using System.Text;

namespace AIService.Application.Features.Embeddings.Commands.SyncExerciseEmbedding
{
    public class SyncExerciseEmbeddingCommandHandler : IRequestHandler<SyncExerciseEmbeddingCommand, bool>
    {
        private readonly IApplicationDbContext _context;
        private readonly IEmbeddingService _embeddingService;
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _exerciseVectors;
        private readonly ILogger<SyncExerciseEmbeddingCommandHandler> _logger;

        public SyncExerciseEmbeddingCommandHandler(
            IApplicationDbContext context,
            IEmbeddingService embeddingService,
            VectorStoreCollection<Guid, ExerciseVectorRecord> exerciseVectors,
            ILogger<SyncExerciseEmbeddingCommandHandler> logger)
        {
            _context = context;
            _embeddingService = embeddingService;
            _exerciseVectors = exerciseVectors;
            _logger = logger;
        }

        public async Task<bool> Handle(SyncExerciseEmbeddingCommand request, CancellationToken cancellationToken)
        {
            var exercise = await _context.Exercises
                .Include(e => e.Category)
                .Include(e => e.Equipments)
                .Include(e => e.ExerciseMuscles).ThenInclude(em => em.MuscleGroup)
                .FirstOrDefaultAsync(e => e.Id == request.ExerciseId, cancellationToken);

            if (exercise == null)
            {
                _logger.LogWarning("[SyncEmbedding] Bài tập không tồn tại: {Id}", request.ExerciseId);
                return false;
            }

            try
            {
                await _exerciseVectors.EnsureCollectionExistsAsync(cancellationToken);

                string payloadText = GenerateTextForAI(exercise);

                var vectorArray = await _embeddingService.GenerateEmbeddingAsync(payloadText, cancellationToken);

                if (vectorArray == null || vectorArray.Length == 0)
                {
                    _logger.LogWarning("[SyncEmbedding] Vector rỗng cho bài tập: {Name}", exercise.Name);
                    return false;
                }

                var qdrantId = exercise.UUId ?? new Guid(MD5.HashData(Encoding.UTF8.GetBytes($"exercise:{exercise.Id}")));

                var primaryMuscleNames = exercise.ExerciseMuscles
                    .Where(m => m.IsPrimary)
                    .Select(m => m.MuscleGroup.NameEN).ToList();

                var secondaryMuscleNames = exercise.ExerciseMuscles
                    .Where(m => !m.IsPrimary)
                    .Select(m => m.MuscleGroup.NameEN).ToList();

                var equipmentNames = exercise.Equipments.Select(e => e.Name).ToList();

                var record = new ExerciseVectorRecord
                {
                    Id = qdrantId,
                    Vector = new ReadOnlyMemory<float>(vectorArray),
                    ExerciseId = exercise.Id,
                    Name = exercise.Name,
                    Category = exercise.Category?.Name ?? "General",
                    CategoryVN = exercise.Category?.NameVN ?? "",
                    PrimaryMuscles = primaryMuscleNames,
                    SecondaryMuscles = secondaryMuscleNames,
                    Equipments = equipmentNames,
                    IsBodyweight = !equipmentNames.Any(),
                    LocationTypes = exercise.LocationType ?? new List<string>(),
                    HasImage = !string.IsNullOrEmpty(exercise.ImageUrl),
                    ImageUrl = exercise.ImageUrl ?? "",
                    ImageThumbnailUrl = exercise.ImageThumbnailUrl ?? "",
                    IsFrontImage = exercise.IsFrontImage,
                    EmbedVersion = 1,
                    EmbeddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                };

                await _exerciseVectors.UpsertAsync(record, cancellationToken: cancellationToken);

                exercise.UpdateEmbedStatus(EmbedStatus.embedded);
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation($"[SyncEmbedding] Hoàn tất nhúng lại Bài tập: {exercise.Name}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[SyncEmbedding] Lỗi khi xử lý Bài tập {exercise.Name}");
                throw;
            }
        }

        private string GenerateTextForAI(Domain.Entities.Exercise exercise)
        {
            var primaryMuscles = exercise.ExerciseMuscles.Where(m => m.IsPrimary).Select(m => m.MuscleGroup.NameEN).ToList();
            var secondaryMuscles = exercise.ExerciseMuscles.Where(m => !m.IsPrimary).Select(m => m.MuscleGroup.NameEN).ToList();
            var equipments = exercise.Equipments.Select(e => e.Name).ToList();
            var locations = exercise.LocationType ?? new List<string>();

            var sb = new StringBuilder();
            sb.AppendLine($"Exercise: {exercise.Name}.");
            var categoryName = exercise.Category?.Name ?? "General";
            var categoryVN = exercise.Category?.NameVN;
            sb.AppendLine(!string.IsNullOrWhiteSpace(categoryVN) ? $"Category: {categoryName} ({categoryVN})." : $"Category: {categoryName}.");
            if (primaryMuscles.Any()) sb.AppendLine($"Primary muscles targeted: {string.Join(", ", primaryMuscles)}.");
            if (secondaryMuscles.Any()) sb.AppendLine($"Secondary muscles involved: {string.Join(", ", secondaryMuscles)}.");
            sb.AppendLine(equipments.Any() ? $"Equipment required: {string.Join(", ", equipments)}." : "Equipment required: None (bodyweight exercise).");
            if (locations.Any())
            {
                var locationText = locations.Count == 1 ? $"This exercise is suitable for {locations[0]}." : $"This exercise can be performed at: {string.Join(", ", locations)}.";
                sb.AppendLine(locationText);
            }
            if (!string.IsNullOrWhiteSpace(exercise.Description)) sb.AppendLine($"Description: {exercise.Description.Trim()}.");
            return sb.ToString().Trim();
        }
    }
}
