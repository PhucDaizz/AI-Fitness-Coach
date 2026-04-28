using MediatR;

namespace AIService.Application.Features.AI.Commands.StreamFitnessChat
{
    public record StreamFitnessChatCommand(
        string Question,
        string SessionId,
        string UserId,
        Guid MessageId,
        string? AccessToken = null
    ) : IRequest;
}
