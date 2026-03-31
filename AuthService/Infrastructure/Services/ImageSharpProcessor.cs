using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using Microsoft.Extensions.Logging;
using Application.Common.Interfaces;

namespace Infrastructure.Services
{
    public class ImageSharpProcessor : IImageProcessor
    {
        private readonly ILogger<ImageSharpProcessor> _logger;

        public ImageSharpProcessor(ILogger<ImageSharpProcessor> logger)
        {
            _logger = logger;
        }

        public async Task<Stream> ResizeAsync(
            Stream imageStream,
            int width,
            int height,
            string format = "webp",
            int quality = 80,
            CancellationToken cancellationToken = default)
        {
            try
            {
                imageStream.Position = 0;

                using var image = await Image.LoadAsync(imageStream, cancellationToken);

                // Calculate aspect ratio preserving resize
                var options = new ResizeOptions
                {
                    Size = new Size(width, height),
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center,
                    Compand = true
                };

                image.Mutate(x => x.Resize(options));

                // Auto-orient based on EXIF
                image.Mutate(x => x.AutoOrient());

                var outputStream = new MemoryStream();

                switch (format.ToLower())
                {
                    case "webp":
                        var webpEncoder = new WebpEncoder
                        {
                            Quality = quality,
                            Method = WebpEncodingMethod.BestQuality,
                            FileFormat = WebpFileFormatType.Lossy
                        };
                        await image.SaveAsync(outputStream, webpEncoder, cancellationToken);
                        break;

                    case "jpg":
                    case "jpeg":
                        await image.SaveAsJpegAsync(outputStream, cancellationToken: cancellationToken);
                        break;

                    case "png":
                        await image.SaveAsPngAsync(outputStream, cancellationToken: cancellationToken);
                        break;

                    default:
                        await image.SaveAsWebpAsync(outputStream, cancellationToken: cancellationToken);
                        break;
                }

                outputStream.Position = 0;
                return outputStream;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resize image");
                throw;
            }
        }

        public async Task<bool> IsValidImageAsync(Stream imageStream, CancellationToken cancellationToken = default)
        {
            try
            {
                imageStream.Position = 0;
                var info = await Image.IdentifyAsync(imageStream, cancellationToken);
                imageStream.Position = 0;
                return info != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<Stream> CompressAsync(Stream imageStream, int quality = 80, CancellationToken cancellationToken = default)
        {
            try
            {
                imageStream.Position = 0;
                using var image = await Image.LoadAsync(imageStream, cancellationToken);

                var outputStream = new MemoryStream();

                // Sử dụng WebP để nén tốt nhất (giảm dung lượng mà ít vỡ ảnh)
                var encoder = new WebpEncoder
                {
                    Quality = quality,
                    Method = WebpEncodingMethod.BestQuality,
                    FileFormat = WebpFileFormatType.Lossy
                };

                await image.SaveAsWebpAsync(outputStream, encoder, cancellationToken);

                outputStream.Position = 0;
                return outputStream;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to compress image");
                throw;
            }
        }

        public async Task<(int width, int height)> GetImageDimensionsAsync(Stream imageStream, CancellationToken cancellationToken = default)
        {
            try
            {
                imageStream.Position = 0;
                var info = await Image.IdentifyAsync(imageStream, cancellationToken);

                if (info == null)
                    throw new InvalidOperationException("Unable to identify image dimensions.");

                return (info.Width, info.Height);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get image dimensions");
                throw;
            }
        }

        public async Task<string> ConvertToBase64Async(Stream imageStream, string format = "webp", int quality = 80, CancellationToken cancellationToken = default)
        {
            try
            {
                imageStream.Position = 0;
                using var image = await Image.LoadAsync(imageStream, cancellationToken);

                // Xử lý xoay ảnh theo EXIF (ví dụ ảnh chụp điện thoại bị ngược)
                image.Mutate(x => x.AutoOrient());

                using var memoryStream = new MemoryStream();

                // Encode ảnh theo format yêu cầu trước khi chuyển sang Base64
                switch (format.ToLower())
                {
                    case "jpg":
                    case "jpeg":
                        await image.SaveAsJpegAsync(memoryStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder { Quality = quality }, cancellationToken);
                        break;
                    case "png":
                        await image.SaveAsPngAsync(memoryStream, cancellationToken);
                        break;
                    case "webp":
                    default:
                        var webpEncoder = new WebpEncoder
                        {
                            Quality = quality,
                            FileFormat = WebpFileFormatType.Lossy
                        };
                        await image.SaveAsWebpAsync(memoryStream, webpEncoder, cancellationToken);
                        break;
                }

                return Convert.ToBase64String(memoryStream.ToArray());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to convert image to Base64");
                throw;
            }
        }
    }
}
