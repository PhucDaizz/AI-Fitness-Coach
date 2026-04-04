using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Commands.UpdateMuscleGroup
{
    public class UpdateMuscleGroupCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
        public string NameEN { get; set; } = default!;
        public string? NameVN { get; set; }
        public bool IsFront { get; set; }
    }
}
