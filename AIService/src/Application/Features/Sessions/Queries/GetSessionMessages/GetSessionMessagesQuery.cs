using AIService.Application.DTOs.ChatMessage;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Sessions.Queries.GetSessionMessages
{
    public record GetSessionMessagesQuery(
        Guid SessionId,
        string UserId,
        DateTime? BeforeTimestamp = null,
        int PageSize = 20)
        : IRequest<Result<CursorPagedResult<ChatMessageDto>>>;
}
