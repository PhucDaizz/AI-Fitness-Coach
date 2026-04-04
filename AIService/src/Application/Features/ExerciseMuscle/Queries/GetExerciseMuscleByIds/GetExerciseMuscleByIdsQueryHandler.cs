using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.ExerciseMuscle.Queries.GetExerciseMuscleByIds
{
    public class GetExerciseMuscleByIdsQueryHandler : IRequestHandler<GetExerciseMuscleByIdsQuery, Result<Domain.Entities.ExerciseMuscle>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseMuscleByIdsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Domain.Entities.ExerciseMuscle>> Handle(GetExerciseMuscleByIdsQuery request, CancellationToken cancellationToken)
        {
            var exerciseMuscle = await _context.ExerciseMuscles
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ExerciseId == request.ExerciseId && x.MuscleId == request.MuscleId, cancellationToken);

            if (exerciseMuscle == null)
            {
                return Result.Failure<Domain.Entities.ExerciseMuscle>(new Error("ExerciseMuscle.NotFound", $"Không tìm thấy ExerciseMuscle với ExerciseId: {request.ExerciseId} và MuscleId: {request.MuscleId}"));
            }

            return Result.Success(exerciseMuscle);
        }
    }
}
