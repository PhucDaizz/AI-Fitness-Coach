using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using AIService.Domain.Enum;

namespace AIService.Infrastructure.BackgroundJobs
{
    public sealed class ChatResponseSaver : IChatResponseSaver
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ChatResponseSaver> _logger;

        public ChatResponseSaver(IServiceScopeFactory scopeFactory, ILogger<ChatResponseSaver> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task SaveAsync(ChatSaveRequest request)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var sp = scope.ServiceProvider;

                var unitOfWork = sp.GetRequiredService<IUnitOfWork>();
                var cacheService = sp.GetRequiredService<ICacheService>();
                var integrationEventSvc = sp.GetRequiredService<IIntegrationEventService>();

                await SaveTokenStatsAsync(unitOfWork, request.PromptTokens, request.CompletionTokens);
                await SaveSessionMessageAsync(unitOfWork, request);

                await unitOfWork.SaveChangesAsync(CancellationToken.None);

                await PublishEventsAsync(cacheService, integrationEventSvc, request);

                _logger.LogInformation("[Saver] Background saved. MsgId: {Id}", request.MessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Saver] Background save failed. MsgId: {Id}", request.MessageId);
            }
        }

        private static async Task SaveTokenStatsAsync(IUnitOfWork uow, int prompt, int completion)
        {
            var total = prompt + completion;
            if (total <= 0) return;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var stat = await uow.TokenDailyStatRepository.GetByDateAsync(today, CancellationToken.None);

            if (stat == null)
            {
                stat = new TokenDailyStat(today);
                stat.AddTokens(prompt, completion, total);
                await uow.TokenDailyStatRepository.AddAsync(stat, CancellationToken.None);
            }
            else
            {
                stat.AddTokens(prompt, completion, total);
                uow.TokenDailyStatRepository.Update(stat);
            }
        }

        private static async Task SaveSessionMessageAsync(IUnitOfWork uow, ChatSaveRequest request)
        {
            var session = await uow.SessionRepository.GetByIdAsync(request.SessionId, CancellationToken.None);
            session?.AddAssistantMessage(request.MessageId, request.ResponseText, request.PromptTokens, request.CompletionTokens);

            await uow.SaveChangesAsync(CancellationToken.None);
        }

        private static async Task PublishEventsAsync(
            ICacheService cache,
            IIntegrationEventService events,
            ChatSaveRequest request)
        {
            var aiMsgCache = new
            {
                Role = MessageRole.Assistant.ToString(),
                Content = request.ResponseText,
                CreatedAt = DateTime.UtcNow
            };

            var aiEvent = new MessageEmbeddingRequested
            {
                MessageId = request.MessageId,
                SessionId = request.SessionId,
                UserId = request.UserId,
                Role = MessageRole.Assistant.ToString(),
                Content = request.ResponseText,
                CreatedAt = DateTime.UtcNow
            };

            await Task.WhenAll(
                cache.AppendToChatHistoryAsync(request.SessionId, aiMsgCache, TimeSpan.FromHours(24)),
                events.PublishToQueueAsync("ai-service-message-embedding-queue", aiEvent, CancellationToken.None)
            );
        }
    }
}
