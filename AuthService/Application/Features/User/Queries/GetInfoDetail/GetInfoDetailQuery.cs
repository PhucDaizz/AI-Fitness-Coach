using Application.DTOs.User;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Queries.GetInfoDetail
{
    public class GetInfoDetailQuery: IRequest<Result<InforDto>>
    {
        public string UserId { get; init; }
    }
}
