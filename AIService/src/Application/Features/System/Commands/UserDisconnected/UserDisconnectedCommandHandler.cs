using AIService.Application.Common.Interfaces;
using MediatR;

namespace AIService.Application.Features.System.Commands.UserDisconnected
{
    public class UserDisconnectedCommandHandler : IRequestHandler<UserDisconnectedCommand>
    {
        private readonly ICacheService _cacheService;
        private readonly IChatNotifier _chatNotifier;

        public UserDisconnectedCommandHandler(ICacheService cacheService, IChatNotifier chatNotifier)
        {
            _cacheService = cacheService;
            _chatNotifier = chatNotifier;
        }

        public async Task Handle(UserDisconnectedCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.UserId)) return;

            var remaining = await _cacheService.DecrementOnlineUserAsync(request.UserId);
            if (remaining <= 0)
            {
                await _cacheService.RemoveOnlineUserAsync(request.UserId);
            }

            long currentCount = await _cacheService.GetOnlineUsersCountAsync();

            await _chatNotifier.BroadcastOnlineUsersCountAsync(currentCount);
        }
    }
}
