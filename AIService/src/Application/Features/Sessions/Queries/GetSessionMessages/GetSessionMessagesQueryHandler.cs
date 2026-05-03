using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Sessions.Queries.GetSessionMessages
{
    public class GetSessionMessagesQueryHandler
        : IRequestHandler<GetSessionMessagesQuery, Result<CursorPagedResult<ChatMessageDto>>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICacheService _cacheService;

        public GetSessionMessagesQueryHandler(
            IApplicationDbContext context,
            ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        public async Task<Result<CursorPagedResult<ChatMessageDto>>> Handle(
            GetSessionMessagesQuery request,
            CancellationToken cancellationToken)
        {
            var isOwner = await _context.Sessions
                .AnyAsync(x => x.Id == request.SessionId && x.UserId == request.UserId, cancellationToken);

            if (!isOwner)
            {
                return Result.Failure<CursorPagedResult<ChatMessageDto>>(new Error(
                    "SESSION_NOT_FOUND",
                    "No chat session found, or you do not have permission to access it."));
            }

            var query = _context.Messages
                .Where(m => m.SessionId == request.SessionId);

            if (request.BeforeTimestamp.HasValue)
            {
                query = query.Where(m => m.CreatedAt < request.BeforeTimestamp.Value);
            }

            var messages = await query
                .AsNoTracking()
                .OrderByDescending(m => m.CreatedAt)
                .Take(request.PageSize + 1)
                .Select(m => new ChatMessageDto
                (
                    m.Id,
                    m.Role.ToString(),
                    m.Content,
                    m.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            bool hasMore = messages.Count > request.PageSize;

            if (hasMore)
            {
                messages.RemoveAt(messages.Count - 1); 
            }

            DateTime? nextCursor = messages.Any() ? messages.Min(m => m.CreatedAt) : null;

            var finalItems = messages.OrderBy(m => m.CreatedAt).ToList();

            var result = new CursorPagedResult<ChatMessageDto>(
                items: messages.OrderBy(m => m.CreatedAt).ToList(),
                hasMore: hasMore,
                nextCursor: nextCursor
            );

            if (!request.BeforeTimestamp.HasValue && finalItems.Any())
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        bool isCacheWarm = await _cacheService.HasChatHistoryAsync(request.SessionId);

                        if (!isCacheWarm)
                        {
                            var recentForAi = finalItems.TakeLast(6).ToList();

                            await _cacheService.RefreshChatHistoryAsync(request.SessionId, recentForAi, TimeSpan.FromHours(24));
                        }
                    }
                    catch (Exception ex)
                    {
                    }
                });
            }

            return Result.Success(result);
        }
    }
}