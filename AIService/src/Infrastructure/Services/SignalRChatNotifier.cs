using AIService.Application.Common.Interfaces;
using AIService.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace AIService.Infrastructure.Services
{
    public class SignalRChatNotifier : IChatNotifier
    {
        private readonly IHubContext<ChatHub, HubInterfaces.IChatClient> _hubContext;

        public SignalRChatNotifier(IHubContext<ChatHub, HubInterfaces.IChatClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendMessageChunkAsync(string userId, Guid messageId, string chunk)
        {
            await _hubContext.Clients.User(userId).ReceiveMessageChunk(messageId, chunk);
        }

        public async Task SendMessageCompletedAsync(string userId, Guid messageId)
        {
            await _hubContext.Clients.User(userId).MessageCompleted(messageId);
        }

        public async Task SendMessageAsync(string userId, Guid messageId, string role, string content)
        {
            await _hubContext.Clients.User(userId).ReceiveMessage(messageId, role, content);
        }

        public async Task SendErrorAsync(string userId, string errorMessage)
        {
            await _hubContext.Clients.User(userId).ReceiveError(errorMessage);
        }
    }
}
