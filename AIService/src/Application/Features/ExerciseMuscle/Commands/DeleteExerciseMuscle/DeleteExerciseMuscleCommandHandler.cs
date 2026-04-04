using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseMuscle.Commands.DeleteExerciseMuscle
{
    public class DeleteExerciseMuscleCommandHandler : IRequestHandler<DeleteExerciseMuscleCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteExerciseMuscleCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteExerciseMuscleCommand request, CancellationToken cancellationToken)
        {
            var exerciseMuscle = await _unitOfWork.ExerciseMuscleRepository.GetByKeysAsync(new object[] { request.ExerciseId, request.MuscleId }, cancellationToken);
            
            if (exerciseMuscle == null)
            {
                return Result.Failure<bool>(new Error("ExerciseMuscle.NotFound", $"Không tìm thấy ExerciseMuscle với ExerciseId: {request.ExerciseId} và MuscleId: {request.MuscleId}"));
            }

            _unitOfWork.ExerciseMuscleRepository.Delete(exerciseMuscle);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
