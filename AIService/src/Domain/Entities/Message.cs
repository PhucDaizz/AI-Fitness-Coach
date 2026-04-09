using AIService.Domain.Common;
using AIService.Domain.Enum;

namespace AIService.Domain.Entities
{
    public class Message : BaseEntity<Guid>
    {
        public Guid SessionId { get; private set; }
        public MessageRole Role { get; private set; }
        public string Content { get; private set; }

        public int? PromptTokens { get; private set; }
        public int? CompletionTokens { get; private set; }
        public int? TotalTokens { get; private set; }

        private Message() { }

        private Message(Guid id, Guid sessionId, MessageRole role, string content)
        {
            Id = id;
            SessionId = sessionId;
            Role = role;
            Content = content;
        }

        private Message(Guid id, Guid sessionId, MessageRole role, string content, int promptTokens, int completionTokens)
        {
            Id = id;
            SessionId = sessionId;
            Role = role;
            Content = content;
            PromptTokens = promptTokens;
            CompletionTokens = completionTokens;
            TotalTokens = promptTokens + completionTokens;
        }


        internal static Message CreateUserMessage(Guid id, Guid sessionId, string content)
        {
            return new Message(id, sessionId, MessageRole.User, content);
        }

        internal static Message CreateAssistantMessage(Guid id, Guid sessionId, string content, int promptTokens, int completionTokens)
        {
            return new Message(id, sessionId, MessageRole.Assistant, content, promptTokens, completionTokens);
        }

        internal static Message CreateSystemMessage(Guid id, Guid sessionId, string content)
        {
            return new Message(id, sessionId, MessageRole.System, content);
        }
    }
}
