using Domain.Common.Cloudinary;

namespace Application.Contracts
{
    public interface ICloudinaryService
    {
        // Upload methods
        Task<CloudinaryUploadResult> UploadAsync(Stream fileStream, string fileName,
            string folder = null, Dictionary<string, string> tags = null,
            CancellationToken cancellationToken = default);

        Task<CloudinaryUploadResult> UploadBase64Async(string base64String, string fileName,
            string folder = null, Dictionary<string, string> tags = null,
            CancellationToken cancellationToken = default);

        Task<CloudinaryUploadResult> UploadFromUrlAsync(string url, string fileName,
            string folder = null, Dictionary<string, string> tags = null,
            CancellationToken cancellationToken = default);

        // Delete methods
        Task<CloudinaryDeletionResult> DeleteAsync(string publicId,
            CancellationToken cancellationToken = default);

        Task<List<CloudinaryDeletionResult>> DeleteManyAsync(List<string> publicIds,
            CancellationToken cancellationToken = default);

        Task<CloudinaryDeletionResult> DeleteByUrlAsync(string url,
            CancellationToken cancellationToken = default);

        // Utility methods
        string ExtractPublicIdFromUrl(string url);
        bool IsCloudinaryUrl(string url);
        string GenerateSignature(Dictionary<string, object> parameters);
        string GenerateUploadPreset(string presetName = "avatar_upload");

        // Transformation methods
        string GetOptimizedUrl(string publicIdOrUrl, int? width = null, int? height = null,
            string transformation = null);

        string GetBlurredPlaceholder(string publicIdOrUrl, int blurLevel = 10);
        string GetWebPUrl(string publicIdOrUrl, int quality = 80);
    }
}
