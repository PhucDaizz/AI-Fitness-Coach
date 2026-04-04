using AIService.Application.Common.Interfaces;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Exercise.Queries.GetExercises
{
    public class GetExercisesQueryHandler : IRequestHandler<GetExercisesQuery, Result<PagedResult<Domain.Entities.Exercise>>>
    {
        private readonly IApplicationDbContext _context;

        public GetExercisesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<Domain.Entities.Exercise>>> Handle(GetExercisesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Exercises.AsNoTracking();

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

            var pagedResult = PagedResult<Domain.Entities.Exercise>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
