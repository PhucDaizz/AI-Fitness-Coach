using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Exercise.Queries.GetExerciseById
{
    public class GetExerciseByIdQueryHandler : IRequestHandler<GetExerciseByIdQuery, Result<Domain.Entities.Exercise>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Domain.Entities.Exercise>> Handle(GetExerciseByIdQuery request, CancellationToken cancellationToken)
        {
            var exercise = await _context.Exercises
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (exercise == null)
            {
                return Result.Failure<Domain.Entities.Exercise>(new Error("Exercise.NotFound", $"Không tìm thấy bài tập với Id: {request.Id}"));
            }

            return Result.Success(exercise);
        }
    }
}
