using System;
using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.Features.Sessions.Commands.ChangeTitle;
using AIService.Application.Features.Sessions.Commands.DeleteSession;
using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.Sessions
{
    public class SessionCommandTests
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISessionRepository _sessionRepository;
        private readonly ICacheService _cacheService;
        private readonly VectorStoreCollection<Guid, ChatMessageVectorRecord> _messageVectors;
        private readonly ILogger<DeleteFitnessChatSessionCommandHandler> _deleteLogger;

        public SessionCommandTests()
        {
            _unitOfWork = Substitute.For<IUnitOfWork>();
            _sessionRepository = Substitute.For<ISessionRepository>();
            _unitOfWork.SessionRepository.Returns(_sessionRepository);

            _cacheService = Substitute.For<ICacheService>();
            _messageVectors = Substitute.For<VectorStoreCollection<Guid, ChatMessageVectorRecord>>();
            _deleteLogger = Substitute.For<ILogger<DeleteFitnessChatSessionCommandHandler>>();
        }

        #region ChangeTitleCommand Tests

        [Fact]
        public async Task Handle_ChangeTitle_WhenSessionExists_ShouldUpdateTitleAndSave()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var session = Session.Create(sessionId, userId);
            _sessionRepository.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

            var handler = new ChangeTitleCommandHandler(_unitOfWork);
            var command = new ChangeTitleCommand
            {
                SestionId = sessionId,
                UserId = userId.ToString(),
                Title = "New Session Title"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            session.Title.Should().Be("New Session Title");

            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_ChangeTitle_WhenSessionDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            _sessionRepository.GetByIdAsync(sessionId, Arg.Any<CancellationToken>()).Returns((Session)null!);

            var handler = new ChangeTitleCommandHandler(_unitOfWork);
            var command = new ChangeTitleCommand
            {
                SestionId = sessionId,
                Title = "New Title"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("NOT_FOUND");
            result.Error.Message.Should().Be("Can not fount this sestion");

            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region DeleteFitnessChatSessionCommand Tests

        [Fact]
        public async Task Handle_DeleteSession_WhenSessionExistsAndBelongsToUser_ShouldDeleteVectorsSQLAndCache()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var session = Session.Create(sessionId, userId);
            
            // Add a message to mock deletion of vectors
            var msgId = Guid.NewGuid();
            session.AddUserMessage(msgId, "User's Message");
            
            _sessionRepository.SessionWithMessagesAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

            var handler = new DeleteFitnessChatSessionCommandHandler(_unitOfWork, _cacheService, _messageVectors, _deleteLogger);
            var command = new DeleteFitnessChatSessionCommand(sessionId, userId.ToString());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _messageVectors.Received(1).DeleteAsync(msgId, Arg.Any<CancellationToken>());
            _sessionRepository.Received(1).Delete(session);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
            await _cacheService.Received(1).DeleteChatHistoryAsync(sessionId);
        }

        [Fact]
        public async Task Handle_DeleteSession_WhenSessionDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            _sessionRepository.SessionWithMessagesAsync(sessionId, Arg.Any<CancellationToken>()).Returns((Session)null!);

            var handler = new DeleteFitnessChatSessionCommandHandler(_unitOfWork, _cacheService, _messageVectors, _deleteLogger);
            var command = new DeleteFitnessChatSessionCommand(sessionId, Guid.NewGuid().ToString());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("SessionNotFound");
            result.Error.Message.Should().Be("Session không tồn tại hoặc không thuộc về User");

            await _messageVectors.DidNotReceiveWithAnyArgs().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
            _sessionRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
            await _cacheService.DidNotReceiveWithAnyArgs().DeleteChatHistoryAsync(Arg.Any<Guid>());
        }

        [Fact]
        public async Task Handle_DeleteSession_WhenSessionBelongsToDifferentUser_ShouldReturnFailureResult()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var ownerId = Guid.NewGuid();
            var someoneElseId = Guid.NewGuid();
            var session = Session.Create(sessionId, ownerId);
            _sessionRepository.SessionWithMessagesAsync(sessionId, Arg.Any<CancellationToken>()).Returns(session);

            var handler = new DeleteFitnessChatSessionCommandHandler(_unitOfWork, _cacheService, _messageVectors, _deleteLogger);
            var command = new DeleteFitnessChatSessionCommand(sessionId, someoneElseId.ToString());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("SessionNotFound");
            result.Error.Message.Should().Be("Session không tồn tại hoặc không thuộc về User");

            await _messageVectors.DidNotReceiveWithAnyArgs().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
            _sessionRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
            await _cacheService.DidNotReceiveWithAnyArgs().DeleteChatHistoryAsync(Arg.Any<Guid>());
        }

        #endregion
    }
}
