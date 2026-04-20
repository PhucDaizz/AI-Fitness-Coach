using MediatR;

namespace AIService.Application.Features.System.Commands.UserDisconnected
{
    public record UserDisconnectedCommand(string UserId) : IRequest;
}
