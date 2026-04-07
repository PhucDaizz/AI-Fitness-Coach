using AIService.Domain.Common;

namespace AIService.Domain.Entities
{
    public class Session: BaseEntity<Guid>, AggregateRoot
    {
        public string UserId { get; private set; }
        public string? Title { get; private set; }
        private List<Message> _messages = new();
        public IReadOnlyCollection<Message> Messages => _messages.AsReadOnly();

        private Session() { }

        private Session(Guid userId)
        {
            Id = Guid.NewGuid();
            UserId = userId.ToString();
        }

        public static Session Create(Guid userId)
        {
            return new Session(userId);
        }

        public void UpdateTitle(string title)
        {
            Title = title;
            UpdatedAt = DateTime.Now;
        }

        public void AddUserMessage(string content)
        {
            var message = Message.CreateUserMessage(this.Id, content);
            _messages.Add(message);

            UpdatedAt = DateTime.UtcNow;
        }

        public void AddAssistantMessage(string content, int promptTokens, int completionTokens)
        {
            var message = Message.CreateAssistantMessage(this.Id, content, promptTokens, completionTokens);
            _messages.Add(message);

            UpdatedAt = DateTime.UtcNow;
        }

        public void AddSystemMessage(string content)
        {
            var message = Message.CreateSystemMessage(this.Id, content);
            _messages.Add(message);

            UpdatedAt = DateTime.UtcNow;
        }
    }
}
