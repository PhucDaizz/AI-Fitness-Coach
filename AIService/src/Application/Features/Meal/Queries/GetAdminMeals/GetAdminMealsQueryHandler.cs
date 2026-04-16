using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Meal;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Meal.Queries.GetAdminMeals
{
    public class GetAdminMealsQueryHandler : IRequestHandler<GetAdminMealsQuery, Result<PagedResult<AdminMealDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetAdminMealsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<AdminMealDto>>> Handle(GetAdminMealsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Meals.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(x => x.Name.Contains(request.SearchTerm) || (x.Description != null && x.Description.Contains(request.SearchTerm)));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(m => new AdminMealDto(
                    m.Id,
                    m.Name,
                    m.Calories,
                    m.Protein,
                    m.Carbs,
                    m.Fat,
                    m.CuisineType,
                    m.DietTags,
                    m.ImageUrl,
                    m.EmbedStatus.ToString()
                ))
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<AdminMealDto>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
