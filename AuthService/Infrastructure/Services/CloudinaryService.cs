using Application.Common.Interfaces;
using Application.Contracts;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Domain.Common.Cloudinary;
using Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;

namespace Infrastructure.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinarySettings _settings;
        private readonly ILogger<CloudinaryService> _logger;
        private readonly IImageProcessor _imageProcessor;

        public CloudinaryService(
            IOptions<CloudinarySettings> cloudinarySettings,
            ILogger<CloudinaryService> logger,
            IImageProcessor imageProcessor = null)
        {
            _settings = cloudinarySettings.Value;
            _logger = logger;
            _imageProcessor = imageProcessor;

            var account = new Account(
                _settings.CloudName,
                _settings.ApiKey,
                _settings.ApiSecret
            );

            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<CloudinaryUploadResult> UploadAsync(
            Stream fileStream,
            string fileName,
            string folder = null,
            Dictionary<string, string> tags = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Validate file stream
                if (fileStream == null || fileStream.Length == 0)
                    throw new ArgumentException("File stream is empty");

                if (fileStream.Length > _settings.MaxFileSize)
                    throw new ArgumentException($"File size exceeds limit: {_settings.MaxFileSize / 1024 / 1024}MB");

                // Validate file format
                var fileExtension = Path.GetExtension(fileName)?.TrimStart('.').ToLower();
                if (!_settings.AllowedFormats.Contains(fileExtension))
                    throw new ArgumentException($"File format not allowed. Allowed: {string.Join(", ", _settings.AllowedFormats)}");

                // Process image if processor is available (resize, compress, convert to webp)
                Stream processedStream = fileStream;
                if (_imageProcessor != null)
                {
                    try
                    {
                        processedStream = await _imageProcessor.ResizeAsync(
                            fileStream,
                            _settings.AvatarWidth,
                            _settings.AvatarHeight,
                            "webp",
                            quality: 80,
                            cancellationToken
                        );
                        fileName = Path.ChangeExtension(fileName, "webp");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Image processing failed, uploading original");
                        fileStream.Position = 0;
                    }
                }

                var transformation = new Transformation()
                    .Crop("fill")                    
                    .Gravity("face")                 
                    .Quality("auto:good"); 

                transformation.Quality("auto:good");

                // Prepare upload parameters
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, processedStream),
                    Folder = folder ?? _settings.DefaultFolder,
                    Transformation = transformation,
                    Tags = tags != null ? string.Join(",", tags.Values) : null,
                    Overwrite = false,
                    UseFilename = true,
                    UniqueFilename = true,
                    Invalidate = true,
                    Colors = true,
                    Faces = true,
                    Format = "webp"
                };

                // Execute upload
                var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

                if (uploadResult.Error != null)
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");

                // Map to our result model
                return MapToUploadResult(uploadResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file: {FileName}", fileName);
                throw;
            }
            finally
            {
                fileStream?.Dispose();
            }
        }

        public async Task<CloudinaryUploadResult> UploadBase64Async(
            string base64String,
            string fileName,
            string folder = null,
            Dictionary<string, string> tags = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Remove data URL prefix if present
                if (base64String.Contains("base64,"))
                    base64String = base64String.Split(',')[1];

                var bytes = Convert.FromBase64String(base64String);
                using var stream = new MemoryStream(bytes);

                return await UploadAsync(stream, fileName, folder, tags, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload base64 image");
                throw;
            }
        }

        public async Task<CloudinaryDeletionResult> DeleteAsync(
            string publicId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                    return new CloudinaryDeletionResult { Error = "Public ID is required" };

                var deletionParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Image,
                    Invalidate = true
                };

                var result = await _cloudinary.DestroyAsync(deletionParams);

                return new CloudinaryDeletionResult
                {
                    PublicId = publicId,
                    IsDeleted = result.Result == "ok",
                    Result = result.Result,
                    Error = result.Error?.Message
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete Cloudinary resource: {PublicId}", publicId);
                return new CloudinaryDeletionResult
                {
                    PublicId = publicId,
                    IsDeleted = false,
                    Error = ex.Message
                };
            }
        }

        public async Task<CloudinaryDeletionResult> DeleteByUrlAsync(
            string url,
            CancellationToken cancellationToken = default)
        {
            var publicId = ExtractPublicIdFromUrl(url);
            if (string.IsNullOrEmpty(publicId))
                return new CloudinaryDeletionResult { Error = "Invalid Cloudinary URL" };

            return await DeleteAsync(publicId, cancellationToken);
        }

        public async Task<List<CloudinaryDeletionResult>> DeleteManyAsync(
            List<string> publicIds,
            CancellationToken cancellationToken = default)
        {
            var results = new List<CloudinaryDeletionResult>();

            foreach (var publicId in publicIds)
            {
                var result = await DeleteAsync(publicId, cancellationToken);
                results.Add(result);
            }

            return results;
        }

        public string ExtractPublicIdFromUrl(string url)
        {
            if (string.IsNullOrEmpty(url) || !IsCloudinaryUrl(url))
                return null;

            try
            {
                var uri = new Uri(url);
                var path = uri.AbsolutePath;

                // Extract public ID from Cloudinary URL pattern
                // Pattern: /v{version}/{public_id}.{format}
                var match = Regex.Match(path, @"/v\d+/(.+?)(?:\.\w+)?$");

                if (match.Success && match.Groups.Count > 1)
                {
                    return match.Groups[1].Value;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        public bool IsCloudinaryUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return false;

            var cloudinaryDomains = new[]
            {
                "res.cloudinary.com",
                $"res-{_settings.CloudName}.cloudinary.com"
            };

            return cloudinaryDomains.Any(domain => url.Contains(domain));
        }

        public string GetOptimizedUrl(string publicIdOrUrl, int? width = null, int? height = null, string transformation = null)
        {
            if (string.IsNullOrEmpty(publicIdOrUrl)) return null;

            try
            {
                // If it's a URL, extract public ID
                string publicId = IsCloudinaryUrl(publicIdOrUrl)
                    ? ExtractPublicIdFromUrl(publicIdOrUrl)
                    : publicIdOrUrl;

                if (string.IsNullOrEmpty(publicId)) return publicIdOrUrl;

                // Build transformation
                var transform = new Transformation();

                if (width.HasValue && height.HasValue)
                    transform.Width(width.Value).Height(height.Value).Crop("fill");
                else if (width.HasValue)
                    transform.Width(width.Value).Crop("scale");
                else if (height.HasValue)
                    transform.Height(height.Value).Crop("scale");

                if (!string.IsNullOrEmpty(transformation))
                    transform = new Transformation().RawTransformation(transformation);

                return _cloudinary.Api.UrlImgUp.Transform(transform).BuildUrl(publicId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to generate optimized URL");
                return publicIdOrUrl;
            }
        }

        private CloudinaryUploadResult MapToUploadResult(ImageUploadResult result)
        {
            return new CloudinaryUploadResult
            {
                PublicId = result.PublicId,
                Url = result.Url?.ToString(),
                SecureUrl = result.SecureUrl?.ToString(),
                Format = result.Format,
                Width = result.Width,
                Height = result.Height,
                Bytes = result.Bytes,
                CreatedAt = result.CreatedAt,
                ResourceType = result.ResourceType,
                Signature = result.Signature,
                Version = result.Version.ToString(),
                Tags = result.Tags?.ToDictionary(t => t, t => t) ?? new Dictionary<string, string>()
            };
        }

        public async Task<CloudinaryUploadResult> UploadFromUrlAsync(string url, string fileName, string folder = null, Dictionary<string, string> tags = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrEmpty(url) || !Uri.IsWellFormedUriString(url, UriKind.Absolute))
                    throw new ArgumentException("Invalid image URL provided.");

                var transformation = new Transformation(_settings.Transformation);
                transformation.Quality("auto:good");

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(url), 
                    Folder = folder ?? _settings.DefaultFolder,
                    PublicId = Path.GetFileNameWithoutExtension(fileName), 
                    Transformation = transformation,
                    Tags = tags != null ? string.Join(",", tags.Values) : null,
                    Overwrite = false,
                    UseFilename = true,
                    UniqueFilename = true,
                    Format = "webp" 
                };

                // 4. Gọi API Upload
                var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

                if (uploadResult.Error != null)
                {
                    throw new Exception($"Cloudinary Error: {uploadResult.Error.Message}");
                }

                return new CloudinaryUploadResult
                {
                    PublicId = uploadResult.PublicId,
                    Url = uploadResult.SecureUrl.ToString(),
                    Format = uploadResult.Format,
                    Width = uploadResult.Width,
                    Height = uploadResult.Height,
                    Bytes = uploadResult.Length
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload image from URL: {Url}", url);
                throw;
            }
        }

        public string GenerateSignature(Dictionary<string, object> parameters)
        {
            return _cloudinary.Api.SignParameters(parameters);
        }

        public string GenerateUploadPreset(string presetName = "avatar_upload")
        {
            try
            {
                var presetParams = new UploadPresetParams
                {
                    Name = presetName,
                    Folder = _settings.DefaultFolder,
                    Transformation = new Transformation(_settings.Transformation),
                    Format = "webp",
                    DisallowPublicId = false,
                    Unsigned = false 
                };

                var result = _cloudinary.CreateUploadPreset(presetParams);
                return result.Name;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate upload preset");
                return presetName;
            }
        }

        public string GetBlurredPlaceholder(string publicIdOrUrl, int blurLevel = 10)
        {
            var publicId = ExtractPublicIdFromUrl(publicIdOrUrl); 

            return _cloudinary.Api.UrlImgUp
                .Transform(new Transformation()
                    .Width(50) 
                    .Effect("blur", blurLevel) 
                    .Quality("auto:low") 
                    .FetchFormat("auto"))
                .BuildUrl(publicId);
        }

        public string GetWebPUrl(string publicIdOrUrl, int quality = 80)
        {
            var publicId = ExtractPublicIdFromUrl(publicIdOrUrl);

            return _cloudinary.Api.UrlImgUp
                .Transform(new Transformation()
                    .Quality(quality)
                    .FetchFormat("webp")) 
                .BuildUrl(publicId);
        }
    }
}
