using System;
using System.Linq;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using AIService.Domain.Events;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class SessionTests
    {
        [Fact]
        public void Create_WithValidData_ShouldReturnSessionWithCorrectProperties()
        {
            // Arrange
            Guid sessionId = Guid.NewGuid();
            Guid userId = Guid.NewGuid();

            // Act
            var session = Session.Create(sessionId, userId);

            // Assert
            session.Should().NotBeNull();
            session.Id.Should().Be(sessionId);
            session.UserId.Should().Be(userId.ToString());
            session.Title.Should().BeNull();
            session.Messages.Should().BeEmpty();
        }

        [Fact]
        public void UpdateTitle_WithValidTitle_ShouldUpdateTitleAndTimestamp()
        {
            // Arrange
            var session = Session.Create(Guid.NewGuid(), Guid.NewGuid());
            string newTitle = "My Fitness Goal";

            // Act
            session.UpdateTitle(newTitle);

            // Assert
            session.Title.Should().Be(newTitle);
            session.UpdatedAt.Should().NotBeNull();
            session.UpdatedAt.Value.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(2));
        }

        [Fact]
        public void AddUserMessage_WithEmptyTitle_ShouldAddMessageAndRaiseFirstMessageAddedEvent()
        {
            // Arrange
            Guid sessionId = Guid.NewGuid();
            var session = Session.Create(sessionId, Guid.NewGuid());
            Guid messageId = Guid.NewGuid();
            string content = "Hello coach, I want to lose weight";

            // Act
            session.AddUserMessage(messageId, content);

            // Assert
            session.Messages.Should().ContainSingle();
            var msg = session.Messages.First();
            msg.Id.Should().Be(messageId);
            msg.SessionId.Should().Be(sessionId);
            msg.Role.Should().Be(MessageRole.User);
            msg.Content.Should().Be(content);
            session.UpdatedAt.Should().NotBeNull();

            // Domain Events
            session.DomainEvents.Should().ContainSingle();
            var domainEvent = session.DomainEvents.First().Should().BeOfType<FirstMessageAddedEvent>().Subject;
            domainEvent.SessionId.Should().Be(sessionId);
            domainEvent.FirstMessageContent.Should().Be(content);
        }

        [Fact]
        public void AddUserMessage_WithExistingTitle_ShouldAddMessageButNotRaiseEvent()
        {
            // Arrange
            Guid sessionId = Guid.NewGuid();
            var session = Session.Create(sessionId, Guid.NewGuid());
            session.UpdateTitle("Existing Title");
            session.ClearDomainEvents();

            Guid messageId = Guid.NewGuid();
            string content = "Another message";

            // Act
            session.AddUserMessage(messageId, content);

            // Assert
            session.Messages.Should().ContainSingle();
            session.DomainEvents.Should().BeEmpty();
        }

        [Fact]
        public void AddAssistantMessage_WithValidData_ShouldAddMessageWithTokenInformation()
        {
            // Arrange
            Guid sessionId = Guid.NewGuid();
            var session = Session.Create(sessionId, Guid.NewGuid());
            Guid messageId = Guid.NewGuid();
            string content = "Sure! Let's start with a nutrition plan.";
            int promptTokens = 15;
            int completionTokens = 25;

            // Act
            session.AddAssistantMessage(messageId, content, promptTokens, completionTokens);

            // Assert
            session.Messages.Should().ContainSingle();
            var msg = session.Messages.First();
            msg.Id.Should().Be(messageId);
            msg.SessionId.Should().Be(sessionId);
            msg.Role.Should().Be(MessageRole.Assistant);
            msg.Content.Should().Be(content);
            msg.PromptTokens.Should().Be(promptTokens);
            msg.CompletionTokens.Should().Be(completionTokens);
            msg.TotalTokens.Should().Be(promptTokens + completionTokens);
            session.UpdatedAt.Should().NotBeNull();
        }

        [Fact]
        public void AddSystemMessage_WithValidData_ShouldAddSystemMessage()
        {
            // Arrange
            Guid sessionId = Guid.NewGuid();
            var session = Session.Create(sessionId, Guid.NewGuid());
            Guid messageId = Guid.NewGuid();
            string content = "System initialized.";

            // Act
            session.AddSystemMessage(messageId, content);

            // Assert
            session.Messages.Should().ContainSingle();
            var msg = session.Messages.First();
            msg.Id.Should().Be(messageId);
            msg.SessionId.Should().Be(sessionId);
            msg.Role.Should().Be(MessageRole.System);
            msg.Content.Should().Be(content);
            session.UpdatedAt.Should().NotBeNull();
        }
    }
}
