using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Queries.GetMuscleGroupById
{
    public class GetMuscleGroupByIdQuery : IRequest<Result<Domain.Entities.MuscleGroup>>
    {
        public int Id { get; set; }
        
        public GetMuscleGroupByIdQuery(int id)
        {
            Id = id;
        }
    }
}
