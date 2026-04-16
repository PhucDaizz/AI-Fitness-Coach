using AIService.Domain.Common;
using AIService.Domain.Events;

namespace AIService.Domain.Entities
{
    public class Session: BaseEntity<Guid>, AggregateRoot
    {
        public string UserId { get; private set; }
        public string? Title { get; private set; }
        private List<Message> _messages = new();
        public IReadOnlyCollection<Message> Messages => _messages.AsReadOnly();

        private Session() { }

        private Session(Guid id, Guid userId)
        {
            Id = id;
            UserId = userId.ToString();
        }

        public static Session Create(Guid id, Guid userId)
        {
            return new Session(id, userId);
        }

        public void UpdateTitle(string title)
        {
            Title = title;
            UpdatedAt = DateTime.Now;
        }

        public void AddUserMessage(Guid messageId, string content)
        {
            var message = Message.CreateUserMessage(messageId, this.Id, content);
            _messages.Add(message);
            UpdatedAt = DateTime.UtcNow;

            if (string.IsNullOrEmpty(Title))
            {
                AddDomainEvent(new FirstMessageAddedEvent(this.Id, content));
            }
        }

        public void AddAssistantMessage(Guid messageId, string content, int promptTokens, int completionTokens)
        {
            var message = Message.CreateAssistantMessage(messageId, this.Id, content, promptTokens, completionTokens);
            _messages.Add(message);
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddSystemMessage(Guid messageId, string content)
        {
            var message = Message.CreateSystemMessage(messageId, this.Id, content);
            _messages.Add(message);
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
