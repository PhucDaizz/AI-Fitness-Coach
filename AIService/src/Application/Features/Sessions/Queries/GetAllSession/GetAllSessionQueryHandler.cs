using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Session;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Sessions.Queries.GetAllSession
{
    public class GetAllSessionQueryHandler : IRequestHandler<GetAllSessionQuery, Result<List<SessionDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllSessionQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<SessionDto>>> Handle(GetAllSessionQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.UserId))
            {
                return Result.Failure<List<SessionDto>>(new Error("USERID_NULL","UserId is required."));
            }

            var Sestions = await _context.Sessions
                .Where(x => x.UserId == request.UserId)
                .AsNoTracking()
                .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
                .Select(x => new SessionDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Title = x.Title
                }).ToListAsync(cancellationToken);

            return Result.Success(Sestions);
        }
    }
}
