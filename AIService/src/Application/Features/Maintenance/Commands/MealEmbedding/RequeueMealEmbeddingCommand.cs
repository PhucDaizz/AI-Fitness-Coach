using MediatR;

namespace AIService.Application.Features.Maintenance.Commands.MealEmbedding
{
    public record RequeueMealEmbeddingCommand : IRequest<int>;
}
