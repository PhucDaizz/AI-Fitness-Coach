using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.CreateExercise
{
    public class CreateExerciseCommandHandler : IRequestHandler<CreateExerciseCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateExerciseCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateExerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = Domain.Entities.Exercise.CreateManual(request.Name, request.Description, request.DescriptionSource);
            
            exercise.SetCategory(request.CategoryId);
            exercise.SetLocationTypes(request.LocationType);
            exercise.SetImages(request.ImageUrl, request.ImageThumbnailUrl, request.IsFrontImage);

            if (request.Muscles != null && request.Muscles.Any())
            {
                foreach (var muscle in request.Muscles)
                {
                    var muscleExists = await _unitOfWork.MuscleGroupRepository.GetByIdAsync(muscle.MuscleId);
                    if (muscleExists != null)
                    {
                        exercise.AddMuscle(muscle.MuscleId, muscle.IsPrimary);
                    }
                }
            }

            if (request.EquipmentIds != null && request.EquipmentIds.Any())
            {
                foreach (var eqId in request.EquipmentIds)
                {
                    var eq = await _unitOfWork.EquipmentRepository.GetByIdAsync(eqId);
                    if (eq != null)
                    {
                        exercise.AddEquipment(eq);
                    }
                }
            }

            await _unitOfWork.ExerciseRepository.AddAsync(exercise, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
