using Domain.Common.Response;
using MediatR;
using System.ComponentModel.DataAnnotations;

namespace AIService.Application.Features.ExerciseMuscle.Commands.CreateExerciseMuscle
{
    public class CreateExerciseMuscleCommand : IRequest<Result<bool>>
    {
        [Required]
        public int ExerciseId { get; set; }
        
        [Required]
        public int MuscleId { get; set; }
        
        public bool IsPrimary { get; set; }
    }
}
