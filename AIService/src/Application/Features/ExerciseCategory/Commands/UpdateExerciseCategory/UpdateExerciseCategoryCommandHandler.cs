using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Commands.UpdateExerciseCategory
{
    public class UpdateExerciseCategoryCommandHandler : IRequestHandler<UpdateExerciseCategoryCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateExerciseCategoryCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateExerciseCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _unitOfWork.ExerciseCategoryRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (category == null)
            {
                return Result.Failure<bool>(new Error("ExerciseCategory.NotFound", $"Không tìm thấy danh mục với Id: {request.Id}"));
            }

            category.Update(request.Name, request.NameVN);
            
            _unitOfWork.ExerciseCategoryRepository.Update(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
