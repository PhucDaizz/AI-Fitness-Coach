using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Features.System.Commands.UserConnected;
using AIService.Application.Features.System.Commands.UserDisconnected;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.System
{
    public class SystemCommandTests
    {
        private readonly ICacheService _cacheService;
        private readonly IChatNotifier _chatNotifier;

        public SystemCommandTests()
        {
            _cacheService = Substitute.For<ICacheService>();
            _chatNotifier = Substitute.For<IChatNotifier>();
        }

        #region UserConnectedCommand Tests

        [Fact]
        public async Task Handle_UserConnected_WithValidUserId_ShouldIncrementCountAndBroadcast()
        {
            // Arrange
            string userId = "user123";
            _cacheService.GetOnlineUsersCountAsync().Returns(5L);

            var handler = new UserConnectedCommandHandler(_cacheService, _chatNotifier);
            var command = new UserConnectedCommand(userId);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _cacheService.Received(1).IncrementOnlineUserAsync(userId);
            await _cacheService.Received(1).GetOnlineUsersCountAsync();
            await _chatNotifier.Received(1).BroadcastOnlineUsersCountAsync(5L);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public async Task Handle_UserConnected_WithEmptyUserId_ShouldDoNothing(string? emptyUserId)
        {
            // Arrange
            var handler = new UserConnectedCommandHandler(_cacheService, _chatNotifier);
            var command = new UserConnectedCommand(emptyUserId!);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _cacheService.DidNotReceiveWithAnyArgs().IncrementOnlineUserAsync(Arg.Any<string>());
            await _cacheService.DidNotReceiveWithAnyArgs().GetOnlineUsersCountAsync();
            await _chatNotifier.DidNotReceiveWithAnyArgs().BroadcastOnlineUsersCountAsync(Arg.Any<long>());
        }

        #endregion

        #region UserDisconnectedCommand Tests

        [Fact]
        public async Task Handle_UserDisconnected_WhenRemainingGreaterThanZero_ShouldDecrementAndBroadcastOnly()
        {
            // Arrange
            string userId = "user123";
            _cacheService.DecrementOnlineUserAsync(userId).Returns(2L);
            _cacheService.GetOnlineUsersCountAsync().Returns(4L);

            var handler = new UserDisconnectedCommandHandler(_cacheService, _chatNotifier);
            var command = new UserDisconnectedCommand(userId);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _cacheService.Received(1).DecrementOnlineUserAsync(userId);
            await _cacheService.DidNotReceive().RemoveOnlineUserAsync(Arg.Any<string>());
            await _cacheService.Received(1).GetOnlineUsersCountAsync();
            await _chatNotifier.Received(1).BroadcastOnlineUsersCountAsync(4L);
        }

        [Fact]
        public async Task Handle_UserDisconnected_WhenRemainingIsZero_ShouldDecrementRemoveAndBroadcast()
        {
            // Arrange
            string userId = "user123";
            _cacheService.DecrementOnlineUserAsync(userId).Returns(0L);
            _cacheService.GetOnlineUsersCountAsync().Returns(3L);

            var handler = new UserDisconnectedCommandHandler(_cacheService, _chatNotifier);
            var command = new UserDisconnectedCommand(userId);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _cacheService.Received(1).DecrementOnlineUserAsync(userId);
            await _cacheService.Received(1).RemoveOnlineUserAsync(userId);
            await _cacheService.Received(1).GetOnlineUsersCountAsync();
            await _chatNotifier.Received(1).BroadcastOnlineUsersCountAsync(3L);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public async Task Handle_UserDisconnected_WithEmptyUserId_ShouldDoNothing(string? emptyUserId)
        {
            // Arrange
            var handler = new UserDisconnectedCommandHandler(_cacheService, _chatNotifier);
            var command = new UserDisconnectedCommand(emptyUserId!);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _cacheService.DidNotReceiveWithAnyArgs().DecrementOnlineUserAsync(Arg.Any<string>());
            await _cacheService.DidNotReceiveWithAnyArgs().RemoveOnlineUserAsync(Arg.Any<string>());
            await _cacheService.DidNotReceiveWithAnyArgs().GetOnlineUsersCountAsync();
            await _chatNotifier.DidNotReceiveWithAnyArgs().BroadcastOnlineUsersCountAsync(Arg.Any<long>());
        }

        #endregion
    }
}
