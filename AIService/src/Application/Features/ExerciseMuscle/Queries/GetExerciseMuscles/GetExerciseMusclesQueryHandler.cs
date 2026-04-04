using AIService.Application.Common.Interfaces;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.ExerciseMuscle.Queries.GetExerciseMuscles
{
    public class GetExerciseMusclesQueryHandler : IRequestHandler<GetExerciseMusclesQuery, Result<PagedResult<Domain.Entities.ExerciseMuscle>>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseMusclesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<Domain.Entities.ExerciseMuscle>>> Handle(GetExerciseMusclesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.ExerciseMuscles.AsNoTracking();

            if (request.ExerciseId.HasValue)
            {
                query = query.Where(x => x.ExerciseId == request.ExerciseId.Value);
            }
            
            if (request.MuscleId.HasValue)
            {
                query = query.Where(x => x.MuscleId == request.MuscleId.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<Domain.Entities.ExerciseMuscle>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
