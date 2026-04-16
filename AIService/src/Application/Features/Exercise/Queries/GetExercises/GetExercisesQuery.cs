using AIService.Application.DTOs.Exercise;
using AIService.Domain.Common.Models;
using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Queries.GetExercises
{
    public class GetExercisesQuery : IRequest<Result<PagedResult<ExerciseListItemDto>>>
    {
        // Text search
        public string? SearchTerm { get; init; }

        // Multi-select filters 
        public List<int> MuscleGroupIds { get; init; } = new();     // Chọn nhiều nhóm cơ
        public List<int> EquipmentIds { get; init; } = new();       // Chọn nhiều thiết bị
        public List<int> CategoryIds { get; init; } = new();        // Chọn nhiều danh mục
        public List<string> LocationTypes { get; init; } = new();   // ["Gym", "Home"]

        // Admin-only filters
        public EmbedStatus? EmbedStatus { get; init; } 

        // Sorting
        public string SortBy { get; init; } = "Name";  // Name, CreatedAt
        public bool SortDescending { get; init; } = false;

        // Pagination
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 20;
    }
}
