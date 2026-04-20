using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Meal;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Queries.GetAdminMeals
{
    public class GetAdminMealsQueryHandler : IRequestHandler<GetAdminMealsQuery, Result<PagedResult<AdminMealDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetAdminMealsQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PagedResult<AdminMealDto>>> Handle(GetAdminMealsQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _unitOfWork.MealRepository.GetAdminMealsAsync(
                request.SearchTerm,
                request.DietTags,
                request.CuisineType,
                request.CaloriesFrom, request.CaloriesTo,
                request.ProteinFrom, request.ProteinTo,
                request.CarbsFrom, request.CarbsTo,
                request.FatFrom, request.FatTo,
                request.EmbedStatus,
                request.SortBy,
                request.SortDescending,
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(m => new AdminMealDto(
                m.Id, m.Name, m.Calories, m.Protein, m.Carbs, m.Fat,
                m.CuisineType, m.DietTags, m.ImageUrl, m.EmbedStatus.ToString()
            )).ToList();

            var pagedResult = PagedResult<AdminMealDto>.Create(dtos, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
