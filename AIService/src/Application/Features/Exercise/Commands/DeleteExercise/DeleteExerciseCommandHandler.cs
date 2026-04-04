using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.DeleteExercise
{
    public class DeleteExerciseCommandHandler : IRequestHandler<DeleteExerciseCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteExerciseCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteExerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = await _unitOfWork.ExerciseRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (exercise == null)
            {
                return Result.Failure<bool>(new Error("Exercise.NotFound", $"Không tìm thấy bài tập với Id: {request.Id}"));
            }

            _unitOfWork.ExerciseRepository.Delete(exercise);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
