namespace Application.Common.Interfaces
{
    public interface IImageProcessor
    {
        Task<Stream> ResizeAsync(Stream imageStream, int width, int height,
            string format = "webp", int quality = 80, CancellationToken cancellationToken = default);

        Task<Stream> CompressAsync(Stream imageStream, int quality = 80,
            CancellationToken cancellationToken = default);

        Task<bool> IsValidImageAsync(Stream imageStream, CancellationToken cancellationToken = default);
        Task<(int width, int height)> GetImageDimensionsAsync(Stream imageStream,
            CancellationToken cancellationToken = default);
        Task<string> ConvertToBase64Async(Stream imageStream, string format = "webp",
            int quality = 80, CancellationToken cancellationToken = default);
    }
}
