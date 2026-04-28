using Domain.Common.Response;
using MediatR;

namespace Application.Features.System.Queries.GetTotalUsersCount
{
    public record GetTotalUsersCountQuery : IRequest<Result<long>>;
}
