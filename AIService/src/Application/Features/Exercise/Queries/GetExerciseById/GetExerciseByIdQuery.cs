using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Queries.GetExerciseById
{
    public class GetExerciseByIdQuery : IRequest<Result<Domain.Entities.Exercise>>
    {
        public int Id { get; set; }
        
        public GetExerciseByIdQuery(int id)
        {
            Id = id;
        }
    }
}
