using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.System.Queries.GetTotalUsersCount
{
    public class GetTotalUsersCountQueryHandler : IRequestHandler<GetTotalUsersCountQuery, Result<long>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICacheService _cacheService;

        public GetTotalUsersCountQueryHandler(IApplicationDbContext context, ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        public async Task<Result<long>> Handle(GetTotalUsersCountQuery request, CancellationToken cancellationToken)
        {
            var cachedCount = await _cacheService.GetTotalUsersCountAsync();

            if (cachedCount.HasValue)
            {
                return Result.Success(cachedCount.Value);
            }

            long actualCount = await _context.Users.CountAsync(cancellationToken);

            await _cacheService.SetTotalUsersCountAsync(actualCount, TimeSpan.FromDays(1));

            return Result.Success(actualCount);
        }
    }
}
