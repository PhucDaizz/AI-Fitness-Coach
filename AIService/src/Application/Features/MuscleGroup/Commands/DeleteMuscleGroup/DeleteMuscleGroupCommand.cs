using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Commands.DeleteMuscleGroup
{
    public class DeleteMuscleGroupCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
    }
}
