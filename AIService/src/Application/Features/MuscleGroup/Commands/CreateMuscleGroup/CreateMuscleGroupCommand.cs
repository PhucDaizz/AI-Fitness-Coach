using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Commands.CreateMuscleGroup
{
    public class CreateMuscleGroupCommand : IRequest<Result<bool>>
    {
        public string NameEN { get; set; } = default!;
        public string? NameVN { get; set; }
        public bool IsFront { get; set; }
    }
}
