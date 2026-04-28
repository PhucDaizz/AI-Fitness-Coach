using AIService.Application.Common.Interfaces;
using MediatR;

namespace AIService.Application.Features.System.Commands.UserConnected
{
    public class UserConnectedCommandHandler : IRequestHandler<UserConnectedCommand>
    {
        private readonly ICacheService _cacheService;
        private readonly IChatNotifier _chatNotifier;

        public UserConnectedCommandHandler(ICacheService cacheService, IChatNotifier chatNotifier)
        {
            _cacheService = cacheService;
            _chatNotifier = chatNotifier;
        }

        public async Task Handle(UserConnectedCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrEmpty(request.UserId))
            {
                await _cacheService.IncrementOnlineUserAsync(request.UserId);

                long currentCount = await _cacheService.GetOnlineUsersCountAsync();

                await _chatNotifier.BroadcastOnlineUsersCountAsync(currentCount);
            }
        }
    }
}
