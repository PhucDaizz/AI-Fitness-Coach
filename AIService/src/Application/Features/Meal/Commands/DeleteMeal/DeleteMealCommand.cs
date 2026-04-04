using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Commands.DeleteMeal
{
    public class DeleteMealCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
    }
}
