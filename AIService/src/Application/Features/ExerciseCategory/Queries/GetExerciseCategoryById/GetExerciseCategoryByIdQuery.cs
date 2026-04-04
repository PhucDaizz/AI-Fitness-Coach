using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategoryById
{
    public class GetExerciseCategoryByIdQuery : IRequest<Result<Domain.Entities.ExerciseCategory>>
    {
        public int Id { get; set; }
        
        public GetExerciseCategoryByIdQuery(int id)
        {
            Id = id;
        }
    }
}
