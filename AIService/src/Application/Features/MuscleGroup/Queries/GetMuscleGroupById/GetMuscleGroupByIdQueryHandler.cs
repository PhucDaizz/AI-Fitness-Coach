using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.MuscleGroup.Queries.GetMuscleGroupById
{
    public class GetMuscleGroupByIdQueryHandler : IRequestHandler<GetMuscleGroupByIdQuery, Result<Domain.Entities.MuscleGroup>>
    {
        private readonly IApplicationDbContext _context;

        public GetMuscleGroupByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Domain.Entities.MuscleGroup>> Handle(GetMuscleGroupByIdQuery request, CancellationToken cancellationToken)
        {
            var muscleGroup = await _context.MuscleGroups
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (muscleGroup == null)
            {
                return Result.Failure<Domain.Entities.MuscleGroup>(new Error("MuscleGroup.NotFound", $"Không tìm thấy nhóm cơ với Id: {request.Id}"));
            }

            return Result.Success(muscleGroup);
        }
    }
}
