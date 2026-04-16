using AIService.Application.DTOs.Exercise;

namespace AIService.Application.Common.Interfaces
{
    public interface IExerciseSearchService
    {
        Task<IReadOnlyList<ExerciseSearchResult>> SearchAsync(
            string query,
            int top = 5,
            double minScore = 0.4,
            CancellationToken ct = default);
    }
}
