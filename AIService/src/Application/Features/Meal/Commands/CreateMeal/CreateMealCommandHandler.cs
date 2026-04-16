using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Commands.CreateMeal
{
    public class CreateMealCommandHandler : IRequestHandler<CreateMealCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateMealCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateMealCommand request, CancellationToken cancellationToken)
        {
            var meal = Domain.Entities.Meal.Create(request.Name, request.Calories, request.Protein, request.Carbs, request.Fat);
            meal.SetDetails(request.Description, request.CuisineType, request.ImageUrl);
            meal.SetDietTags(request.DietTags);
            
            await _unitOfWork.MealRepository.AddAsync(meal, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
