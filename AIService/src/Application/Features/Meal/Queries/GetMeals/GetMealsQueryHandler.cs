using AIService.Application.Common.Interfaces;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Meal.Queries.GetMeals
{
    public class GetMealsQueryHandler : IRequestHandler<GetMealsQuery, Result<PagedResult<Domain.Entities.Meal>>>
    {
        private readonly IApplicationDbContext _context;

        public GetMealsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<Domain.Entities.Meal>>> Handle(GetMealsQuery request, CancellationToken cancellationToken)
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
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<Domain.Entities.Meal>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
