using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.User.Queries.IsUserExisting
{
    public class IsUserExistingQueryHandler : IRequestHandler<IsUserExistingQuery, Result<bool>>
    {
        private readonly IApplicationDbContext _context;

        public IsUserExistingQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<bool>> Handle(IsUserExistingQuery request, CancellationToken cancellationToken)
        {
            var isExisting = await _context.Users.AnyAsync(x => x.Id == request.UserId.ToString(), cancellationToken);
            return Result.Success(isExisting); 
        }
    }
}
