using System.Threading.Channels;
using AIService.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Runtime.CompilerServices;

namespace AIService.Infrastructure.Services
{
    public sealed class ChatStreamingService : IChatStreamingService
    {
        private readonly IChatCompletionService _ptAi;
        private readonly ILogger<ChatStreamingService> _logger;
        private const int MaxRetries = 15;

        public ChatStreamingService(
            Kernel kernel,
            ILogger<ChatStreamingService> logger)
        {
            _ptAi = kernel.GetRequiredService<IChatCompletionService>("pt_brain");
            _logger = logger;
        }

        public async IAsyncEnumerable<StreamingChatMessageContent> StreamResponseAsync(
            ChatHistory chatHistory,
            Kernel kernel,
            [EnumeratorCancellation] CancellationToken ct)
        {
            var channel = Channel.CreateUnbounded<StreamingChatMessageContent>();

            _ = Task.Run(async () =>
            {
                try
                {
                    await StreamToChannelAsync(chatHistory, kernel, channel.Writer, ct);
                }
                finally
                {
                    channel.Writer.Complete();
                }
            }, ct);

            await foreach (var chunk in channel.Reader.ReadAllAsync(ct))
            {
                yield return chunk;
            }
        }

        private async Task StreamToChannelAsync(
            ChatHistory chatHistory,
            Kernel kernel,
            ChannelWriter<StreamingChatMessageContent> writer,
            CancellationToken ct)
        {
            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(autoInvoke: true)
            };

            var attempt = 0;
            var originalHistory = new ChatHistory(chatHistory);

            while (true)
            {
                var currentHistory = new ChatHistory(originalHistory);

                try
                {
                    await foreach (var chunk in _ptAi.GetStreamingChatMessageContentsAsync(
                        currentHistory, settings, kernel, ct))
                    {
                        await writer.WriteAsync(chunk, ct);
                    }
                    return;
                }
                catch (HttpOperationException ex) when (attempt < MaxRetries - 1)
                {
                    attempt++;
                    _logger.LogError(ex,
                        "[Streaming] Retry {Attempt}/{Max}, Status: {Status}",
                        attempt, MaxRetries, ex.StatusCode);

                    await Task.Delay(TimeSpan.FromSeconds(attempt * 2), ct);
                }
            }
        }
    }
}