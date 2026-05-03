using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using System.Security.Cryptography;
using System.Text;

namespace AIService.Application.Features.Exercise.Commands.DeleteExercise
{
    public class DeleteExerciseCommandHandler : IRequestHandler<DeleteExerciseCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _exerciseVectors;
        private readonly ILogger<DeleteExerciseCommandHandler> _logger;

        public DeleteExerciseCommandHandler(
            IUnitOfWork unitOfWork,
            VectorStoreCollection<Guid, ExerciseVectorRecord> exerciseVectors,
            ILogger<DeleteExerciseCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _exerciseVectors = exerciseVectors;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(DeleteExerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = await _unitOfWork.ExerciseRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (exercise == null)
            {
                return Result.Failure<bool>(new Error("Exercise.NotFound", $"Không tìm thấy bài tập với Id: {request.Id}"));
            }

            try
            {
                var qdrantId = exercise.UUId ?? new Guid(MD5.HashData(Encoding.UTF8.GetBytes($"exercise:{exercise.Id}")));

                await _exerciseVectors.DeleteAsync(qdrantId, cancellationToken: cancellationToken);

                _logger.LogInformation("[VectorDB] Đã xóa thành công Vector của bài tập Id: {ExerciseId}", exercise.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[VectorDB] Lỗi khi xóa Vector bài tập Id: {ExerciseId}. Tiếp tục tiến trình xóa SQL...", exercise.Id);
            }

            _unitOfWork.ExerciseRepository.Delete(exercise);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
