using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Runtime.CompilerServices;

namespace AIService.Application.Common.Interfaces
{
    public interface IChatStreamingService
    {
        IAsyncEnumerable<StreamingChatMessageContent> StreamResponseAsync(
             ChatHistory chatHistory,
             Kernel kernel,
             [EnumeratorCancellation] CancellationToken ct);
    }
}
