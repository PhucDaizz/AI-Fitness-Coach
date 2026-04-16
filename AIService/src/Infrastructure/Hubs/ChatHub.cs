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
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
