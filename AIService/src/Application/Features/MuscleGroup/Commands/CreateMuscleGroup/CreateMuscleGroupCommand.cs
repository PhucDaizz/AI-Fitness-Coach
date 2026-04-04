using Domain.Common.Response;
using MediatR;
using System.ComponentModel.DataAnnotations;

namespace AIService.Application.Features.MuscleGroup.Commands.CreateMuscleGroup
{
    public class CreateMuscleGroupCommand : IRequest<Result<bool>>
    {
        [Required]
        public int Id { get; set; } 
        public string NameEN { get; set; } = default!;
        public string? NameVN { get; set; }
        public bool IsFront { get; set; }
    }
}
