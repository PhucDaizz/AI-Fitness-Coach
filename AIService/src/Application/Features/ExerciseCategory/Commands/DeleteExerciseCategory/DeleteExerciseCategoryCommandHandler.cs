using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Commands.DeleteExerciseCategory
{
    public class DeleteExerciseCategoryCommandHandler : IRequestHandler<DeleteExerciseCategoryCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteExerciseCategoryCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteExerciseCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.ExerciseCategoryRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (category == null)
            {
                return Result.Failure<bool>(new Error("ExerciseCategory.NotFound", $"Không tìm thấy danh mục với Id: {request.Id}"));
            }

            _unitOfWork.ExerciseCategoryRepository.Delete(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
