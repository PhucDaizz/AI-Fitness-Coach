using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Commands.DeleteMeal
{
    public class DeleteMealCommandHandler : IRequestHandler<DeleteMealCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteMealCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteMealCommand request, CancellationToken cancellationToken)
        {
            var meal = await _unitOfWork.MealRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (meal == null)
            {
                return Result.Failure<bool>(new Error("Meal.NotFound", $"Không tìm thấy món ăn với Id: {request.Id}"));
            }

            _unitOfWork.MealRepository.Delete(meal);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
