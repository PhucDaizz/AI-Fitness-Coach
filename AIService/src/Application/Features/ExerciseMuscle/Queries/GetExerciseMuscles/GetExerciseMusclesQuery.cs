using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseMuscle.Queries.GetExerciseMuscles
{
    public class GetExerciseMusclesQuery : IRequest<Result<PagedResult<Domain.Entities.ExerciseMuscle>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public int? ExerciseId { get; set; }
        public int? MuscleId { get; set; }
    }
}
