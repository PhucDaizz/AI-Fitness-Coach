using AIService.Application.DTOs.ExerciseCategory;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategoryById
{
    public class GetExerciseCategoryByIdQuery : IRequest<Result<ExerciseCategoryDetailDto>>
    {
        public int Id { get; set; }
        
        public GetExerciseCategoryByIdQuery(int id)
        {
            Id = id;
        }
    }
}
