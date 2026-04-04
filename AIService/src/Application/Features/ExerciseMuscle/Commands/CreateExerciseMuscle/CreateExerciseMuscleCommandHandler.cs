using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseMuscle.Commands.CreateExerciseMuscle
{
    public class CreateExerciseMuscleCommandHandler : IRequestHandler<CreateExerciseMuscleCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateExerciseMuscleCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateExerciseMuscleCommand request, CancellationToken cancellationToken)
        {
            var exerciseMuscle = Domain.Entities.ExerciseMuscle.Create(request.ExerciseId, request.MuscleId, request.IsPrimary);
            
            await _unitOfWork.ExerciseMuscleRepository.AddAsync(exerciseMuscle, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
