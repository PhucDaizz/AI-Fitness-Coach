using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Sessions.Commands.DeleteSession
{
    public record DeleteFitnessChatSessionCommand(Guid SessionId, string UserId) : IRequest<Result<bool>>;

}
