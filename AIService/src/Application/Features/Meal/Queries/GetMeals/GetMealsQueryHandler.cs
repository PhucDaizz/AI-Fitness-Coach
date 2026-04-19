using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Meal;
using AIService.Domain.Common;
using AIService.Domain.Common.Models;
using AIService.Domain.Enum;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Meal.Queries.GetMeals
{
    public class GetMealsQueryHandler : IRequestHandler<GetMealsQuery, Result<PagedResult<MealListItemDto>>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUnitOfWork _unitOfWork;

        public GetMealsQueryHandler(ICurrentUserService currentUserService, IUnitOfWork unitOfWork)
        {
            _currentUserService = currentUserService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PagedResult<MealListItemDto>>> Handle(GetMealsQuery request, CancellationToken cancellationToken)
        {
            var isAdmin = _currentUserService.Role == AppRoles.SysAdmin;

            var (items, totalCount) = await _unitOfWork.MealRepository.GetMealsAsync(
                request.SearchTerm,
                request.DietTags,
                request.CuisineType,
                request.CaloriesFrom, request.CaloriesTo,
                request.ProteinFrom, request.ProteinTo,
                request.CarbsFrom, request.CarbsTo,
                request.FatFrom, request.FatTo,
                request.EmbedStatus,
                isAdmin,
                request.SortBy,
                request.SortDescending,
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(m => new MealListItemDto
            {
                Id = m.Id,
                Name = m.Name,
                Description = m.Description,
                ImageUrl = m.ImageUrl,
                Calories = m.Calories,
                Protein = m.Protein,
                Carbs = m.Carbs,
                Fat = m.Fat,
                CuisineType = m.CuisineType,
                DietTags = m.DietTags,
                EmbedStatus = isAdmin ? m.EmbedStatus : EmbedStatus.embedded
            }).ToList();

            var pagedResult = PagedResult<MealListItemDto>.Create(dtos, totalCount, request.PageNumber, request.PageSize);
            return Result.Success(pagedResult);
        }
    }
}
