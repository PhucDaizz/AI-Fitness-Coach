using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ExerciseCategory;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategories
{
    public class GetExerciseCategoriesQueryHandler : IRequestHandler<GetExerciseCategoriesQuery, Result<PagedResult<ExerciseCategoryDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseCategoriesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<ExerciseCategoryDto>>> Handle(GetExerciseCategoriesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.ExerciseCategories.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(x => x.Name.Contains(request.SearchTerm) || (x.NameVN != null && x.NameVN.Contains(request.SearchTerm)));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new ExerciseCategoryDto(x.Id, x.Name, x.NameVN))
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<ExerciseCategoryDto>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
