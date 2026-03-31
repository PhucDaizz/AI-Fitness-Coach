using Application.Common.Interfaces;
using Application.DTOs.User;
using Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.User.Queries.GetUsersWithPagination
{
    public class GetUsersWithPaginationQueryHandler : IRequestHandler<GetUsersWithPaginationQuery, Result<PagedResult<UserDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetUsersWithPaginationQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<UserDto>>> Handle(GetUsersWithPaginationQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Users
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var search = request.SearchTerm.Trim().ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search) ||
                    u.UserName.ToLower().Contains(search));
            }

            if (request.IsActive.HasValue)
            {
                query = query.Where(u => u.IsActive == request.IsActive.Value);
            }

            if (request.Gender.HasValue)
            {
                query = query.Where(u => u.Gender == request.Gender.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var roleId = await _context.Roles
                    .Where(r => r.Name == request.Role)
                    .Select(r => r.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (roleId != null)
                {
                    var userIdsInRole = _context.UserRoles
                        .Where(ur => ur.RoleId == roleId)
                        .Select(ur => ur.UserId);

                    query = query.Where(u => userIdsInRole.Contains(u.Id));
                }
            }

            query = query.OrderBy(u => u.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    AvatarUrl = u.AvatarUrl,
                    IsActive = u.IsActive,
                    Gender = u.Gender,
                    Role = _context.UserRoles
                            .Where(ur => ur.UserId == u.Id)
                            .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                            .FirstOrDefault() ?? "User"
                })
                .ToListAsync(cancellationToken);

            return Result.Success(new PagedResult<UserDto>(items, totalCount, request.PageNumber, request.PageSize));
        }
    }
}
