using Application.Common.Interfaces;
using Application.DTOs.User;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Queries.GetInfoDetail
{
    public class GetInfoDetailQueryHandler : IRequestHandler<GetInfoDetailQuery, Result<InforDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetInfoDetailQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<InforDto>> Handle(GetInfoDetailQuery request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Auth.GetUserByIdAsync(request.UserId);
            if (user == null)
            {
                return Result.Failure<InforDto>(new Error("NotFound","User not found."));
            }

            var inforDto = new InforDto
            {
                UserName = user.UserName!,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Email = user.Email!,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Gender = user.Gender
            };
                
            return Result.Success(inforDto);
        }
    }
}
