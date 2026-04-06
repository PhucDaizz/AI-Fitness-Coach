using MediatR;

namespace AIService.Application.Features.AI.Queries
{
    public record AskFitnessQuery(
        string Question,
        string SessionId,
        string UserId
    ) : IRequest<string>;
}
