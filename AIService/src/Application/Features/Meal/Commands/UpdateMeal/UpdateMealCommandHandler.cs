using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Commands.UpdateMeal
{
    public class UpdateMealCommandHandler : IRequestHandler<UpdateMealCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateMealCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateMealCommand request, CancellationToken cancellationToken)
        {
            var meal = await _unitOfWork.MealRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (meal == null)
            {
                return Result.Failure<bool>(new Error("Meal.NotFound", $"Không tìm thấy món ăn với Id: {request.Id}"));
            }

            meal.Update(request.Name, request.Calories, request.Protein, request.Carbs, request.Fat);
            meal.SetDetails(request.Description, request.CuisineType, request.ImageUrl);
            meal.SetDietTags(request.DietTags);
            
            _unitOfWork.MealRepository.Update(meal);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
