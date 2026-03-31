using Application.Common.Interfaces;
using Application.Contracts;
using Application.DTOs.User.Event;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Interfaces;

namespace Application.Features.User.Commands.UploadAvatar
{
    public class UploadAvatarCommandHandler : IRequestHandler<UploadAvatarCommand, Result<UploadAvatarResult>>
    {
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UploadAvatarCommandHandler> _logger;
        private readonly IImageProcessor _imageProcessor;
        private readonly IMessagePublisher _messagePublisher;

        public UploadAvatarCommandHandler(
            ICloudinaryService cloudinaryService,
            IUnitOfWork unitOfWork,
            ILogger<UploadAvatarCommandHandler> logger,
            IImageProcessor imageProcessor, 
            IMessagePublisher messagePublisher)
        {
            _cloudinaryService = cloudinaryService;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _imageProcessor = imageProcessor;
            _messagePublisher = messagePublisher;
        }

        public async Task<Result<UploadAvatarResult>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Starting avatar upload for user: {UserId}", request.UserId);

                var user = await _unitOfWork.Auth.GetUserByIdAsync(request.UserId, cancellationToken);
                if (user == null)
                    throw new Exception($"User not found: {request.UserId}");

                string oldAvatarPublicId = null;
                bool oldAvatarDeleted = false;

                // 2. Delete old avatar if exists and requested
                if (request.DeleteOldAvatar && !string.IsNullOrEmpty(user.AvatarUrl))
                {
                    oldAvatarPublicId = _cloudinaryService.ExtractPublicIdFromUrl(user.AvatarUrl);

                    if (!string.IsNullOrEmpty(oldAvatarPublicId))
                    {
                        var deleteResult = await _cloudinaryService.DeleteAsync(oldAvatarPublicId, cancellationToken);
                        oldAvatarDeleted = deleteResult.IsDeleted;

                        if (oldAvatarDeleted)
                            _logger.LogInformation("Deleted old avatar for user {UserId}: {PublicId}",
                                request.UserId, oldAvatarPublicId);
                        else
                            _logger.LogWarning("Failed to delete old avatar for user {UserId}: {Error}",
                                request.UserId, deleteResult.Error);
                    }
                }

                // 3. Validate and process image
                using var fileStream = request.File.OpenReadStream();

                // Validate image
                if (_imageProcessor != null && !await _imageProcessor.IsValidImageAsync(fileStream, cancellationToken))
                    throw new Exception("Invalid image file");

                // Process image if optimization is enabled
                Stream uploadStream = fileStream;
                string fileName = request.File.FileName;

                if (request.OptimizeImage && _imageProcessor != null)
                {
                    uploadStream = await _imageProcessor.ResizeAsync(
                        fileStream,
                        width: 400,
                        height: 400,
                        format: "webp",
                        quality: 85,
                        cancellationToken
                    );
                    fileName = Path.ChangeExtension(fileName, "webp");
                }

                // 4. Upload to Cloudinary
                var tags = new Dictionary<string, string>
                {
                    { "user_id", request.UserId },
                    { "upload_type", "avatar" },
                    { "timestamp", DateTime.UtcNow.ToString("yyyyMMddHHmmss") }
                };

                var uploadResult = await _cloudinaryService.UploadAsync(
                    uploadStream,
                    fileName,
                    request.Folder,
                    tags,
                    cancellationToken
                );

                // 5. Update user record
                user.AvatarUrl = uploadResult.SecureUrl;

                await _unitOfWork.Auth.UpdateUserAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Avatar uploaded successfully for user {UserId}: {PublicId}",
                    request.UserId, uploadResult.PublicId);

                await _messagePublisher.PublishAsync<UserChangeAvatarEvent>(
                        exchange: "user.events",
                        exchangeType: "topic",
                        routingKey: "user.avatar_changed",
                        new UserChangeAvatarEvent
                        {
                            UserId = Guid.Parse(request.UserId),
                            ImageUrl = uploadResult.SecureUrl,
                        }
                    );

                // 7. Return result
                return new UploadAvatarResult
                {
                    PublicId = uploadResult.PublicId,
                    Url = uploadResult.SecureUrl,
                    ThumbnailUrl = uploadResult.GetThumbnailUrl(100, 100),
                    OldAvatarPublicId = oldAvatarPublicId,
                    OldAvatarDeleted = oldAvatarDeleted,
                    UserId = user.Id,
                    UploadedAt = DateTime.UtcNow,
                    FileName = fileName,
                    FileSize = uploadResult.Bytes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload avatar for user: {UserId}", request.UserId);
                throw;
            }
        }

        private string GetClientIp()
        {
            return "unknown";
        }
    }
}
