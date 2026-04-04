using AIService.Application.Common.Interfaces;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.MuscleGroup.Queries.GetMuscleGroups
{
    public class GetMuscleGroupsQueryHandler : IRequestHandler<GetMuscleGroupsQuery, Result<PagedResult<Domain.Entities.MuscleGroup>>>
    {
        private readonly IApplicationDbContext _context;

        public GetMuscleGroupsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<Domain.Entities.MuscleGroup>>> Handle(GetMuscleGroupsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.MuscleGroups.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(x => x.NameEN.Contains(request.SearchTerm) || (x.NameVN != null && x.NameVN.Contains(request.SearchTerm)));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<Domain.Entities.MuscleGroup>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
