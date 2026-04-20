using MediatR;

namespace AIService.Application.Features.System.Commands.UserConnected
{
    public record UserConnectedCommand(string UserId) : IRequest;
}
