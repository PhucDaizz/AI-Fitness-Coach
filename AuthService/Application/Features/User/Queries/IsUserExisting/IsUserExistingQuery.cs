using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Queries.IsUserExisting
{
    public class IsUserExistingQuery: IRequest<Result<bool>>
    {
        public Guid UserId { get; set; }
    }
}
