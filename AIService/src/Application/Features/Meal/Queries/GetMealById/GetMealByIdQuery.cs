using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Queries.GetMealById
{
    public class GetMealByIdQuery : IRequest<Result<Domain.Entities.Meal>>
    {
        public int Id { get; set; }
        
        public GetMealByIdQuery(int id)
        {
            Id = id;
        }
    }
}
