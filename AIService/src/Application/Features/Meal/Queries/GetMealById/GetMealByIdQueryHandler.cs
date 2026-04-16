using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Meal.Queries.GetMealById
{
    public class GetMealByIdQueryHandler : IRequestHandler<GetMealByIdQuery, Result<Domain.Entities.Meal>>
    {
        private readonly IApplicationDbContext _context;

        public GetMealByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Domain.Entities.Meal>> Handle(GetMealByIdQuery request, CancellationToken cancellationToken)
        {
            var meal = await _context.Meals
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (meal == null)
            {
                return Result.Failure<Domain.Entities.Meal>(new Error("Meal.NotFound", $"Không tìm thấy món ăn với Id: {request.Id}"));
            }

            return Result.Success(meal);
        }
    }
}
