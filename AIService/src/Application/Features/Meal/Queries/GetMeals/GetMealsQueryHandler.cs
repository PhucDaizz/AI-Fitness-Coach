using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Meal;
using AIService.Domain.Common;
using AIService.Domain.Common.Models;
using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Meal.Queries.GetMeals
{
    public class GetMealsQueryHandler : IRequestHandler<GetMealsQuery, Result<PagedResult<MealListItemDto>>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public GetMealsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<Result<PagedResult<MealListItemDto>>> Handle(GetMealsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Meals.AsNoTracking();

            var isAdmin = _currentUserService.Role == AppRoles.SysAdmin;

            // 1. Role-based filter
            if (!isAdmin)
            {
                query = query.Where(x => x.EmbedStatus == EmbedStatus.embedded);
            }

            // 2. Text search
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(x => x.Name.Contains(request.SearchTerm) ||
                                        (x.Description != null && x.Description.Contains(request.SearchTerm)));
            }

            // 3. Filter by Diet Tags (JSON array)
            if (request.DietTags.Any())
            {
                query = query.Where(x => x.DietTags.Any(tag => request.DietTags.Contains(tag)));
            }

            // 4. Filter by Cuisine Type
            if (!string.IsNullOrWhiteSpace(request.CuisineType))
            {
                query = query.Where(x => x.CuisineType != null && x.CuisineType.Contains(request.CuisineType));
            }

            // 5. Nutrition range filters
            if (request.CaloriesFrom.HasValue)
                query = query.Where(x => x.Calories >= request.CaloriesFrom.Value);
            if (request.CaloriesTo.HasValue)
                query = query.Where(x => x.Calories <= request.CaloriesTo.Value);

            if (request.ProteinFrom.HasValue)
                query = query.Where(x => x.Protein >= request.ProteinFrom.Value);
            if (request.ProteinTo.HasValue)
                query = query.Where(x => x.Protein <= request.ProteinTo.Value);

            if (request.CarbsFrom.HasValue)
                query = query.Where(x => x.Carbs >= request.CarbsFrom.Value);
            if (request.CarbsTo.HasValue)
                query = query.Where(x => x.Carbs <= request.CarbsTo.Value);

            if (request.FatFrom.HasValue)
                query = query.Where(x => x.Fat >= request.FatFrom.Value);
            if (request.FatTo.HasValue)
                query = query.Where(x => x.Fat <= request.FatTo.Value);

            // 6. Admin-only filter by EmbedStatus
            if (isAdmin && request.EmbedStatus.HasValue)
            {
                query = query.Where(x => x.EmbedStatus == request.EmbedStatus.Value);
            }

            // 7. Sorting
            query = ApplySorting(query, request.SortBy, request.SortDescending);

            // 8. Pagination
            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(m => new MealListItemDto
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
                })
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<MealListItemDto>.Create(items, totalCount, request.PageNumber, request.PageSize);
            return Result.Success(pagedResult);
        }

        private IQueryable<Domain.Entities.Meal> ApplySorting(
            IQueryable<Domain.Entities.Meal> query,
            string sortBy,
            bool sortDescending)
        {
            return (sortBy?.ToLower()) switch
            {
                "name" => sortDescending
                    ? query.OrderByDescending(x => x.Name)
                    : query.OrderBy(x => x.Name),

                "calories" => sortDescending
                    ? query.OrderByDescending(x => x.Calories)
                    : query.OrderBy(x => x.Calories),

                "protein" => sortDescending
                    ? query.OrderByDescending(x => x.Protein)
                    : query.OrderBy(x => x.Protein),

                "carbs" => sortDescending
                    ? query.OrderByDescending(x => x.Carbs)
                    : query.OrderBy(x => x.Carbs),

                "fat" => sortDescending
                    ? query.OrderByDescending(x => x.Fat)
                    : query.OrderBy(x => x.Fat),

                _ => sortDescending
                    ? query.OrderByDescending(x => x.CreatedAt)
                    : query.OrderBy(x => x.CreatedAt)
            };
        }
    }
}
