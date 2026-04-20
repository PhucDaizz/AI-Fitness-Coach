using AIService.Application.Features.System.Commands.UserConnected;
using AIService.Application.Features.System.Commands.UserDisconnected;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace AIService.Infrastructure.Hubs
{
    public class ChatHub: Hub<HubInterfaces.IChatClient>
    {
        private readonly IMediator _mediator;

        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                await _mediator.Send(new UserConnectedCommand(userId));
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                await _mediator.Send(new UserDisconnectedCommand(userId));
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
