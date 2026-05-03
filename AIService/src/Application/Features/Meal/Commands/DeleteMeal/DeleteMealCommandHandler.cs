using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using System.Security.Cryptography;
using System.Text;

namespace AIService.Application.Features.Meal.Commands.DeleteMeal
{
    public class DeleteMealCommandHandler : IRequestHandler<DeleteMealCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly VectorStoreCollection<Guid, MealVectorRecord> _mealVectors;
        private readonly ILogger<DeleteMealCommandHandler> _logger;

        public DeleteMealCommandHandler(
            IUnitOfWork unitOfWork,
            VectorStoreCollection<Guid, MealVectorRecord> mealVectors,
            ILogger<DeleteMealCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _mealVectors = mealVectors;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(DeleteMealCommand request, CancellationToken cancellationToken)
        {
            var meal = await _unitOfWork.MealRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (meal == null)
            {
                return Result.Failure<bool>(new Error("Meal.NotFound", $"Không tìm thấy món ăn với Id: {request.Id}"));
            }

            try
            {
                var qdrantId = new Guid(MD5.HashData(Encoding.UTF8.GetBytes($"meal:{meal.Id}")));

                await _mealVectors.DeleteAsync(qdrantId, cancellationToken: cancellationToken);

                _logger.LogInformation("[VectorDB] Đã xóa thành công Vector của món ăn Id: {MealId}", meal.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[VectorDB] Lỗi khi xóa Vector món ăn Id: {MealId}. Tiếp tục tiến trình xóa SQL...", meal.Id);
            }

            _unitOfWork.MealRepository.Delete(meal);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
