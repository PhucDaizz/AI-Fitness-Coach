using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.UpdateInfor
{
    public class UpdateInforCommandHandler : IRequestHandler<UpdateInforCommand, Result<string>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateInforCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<string>> Handle(UpdateInforCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Auth.GetUserByIdAsync(request.UserId);
            if (user == null)
            {
                return Result.Failure<string>(new Error("NOT.FOUND","User not found"));
            }

            user.Gender = request.Gender ?? user.Gender;
            user.Address = request.Address ?? user.Address;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;

            await _unitOfWork.SaveChangesAsync();

            return Result.Success(user.Id);
        }
    }
}
