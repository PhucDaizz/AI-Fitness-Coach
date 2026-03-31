using Application.DTOs.User;
using Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Queries.GetUsersWithPagination
{
    public class GetUsersWithPaginationQuery : IRequest<Result<PagedResult<UserDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string? SearchTerm { get; set; } 
        public bool? IsActive { get; set; }
        public bool? Gender { get; set; }

        public string? Role { get; set; } 
    }
}
