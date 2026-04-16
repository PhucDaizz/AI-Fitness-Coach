namespace AIService.Application.Common.Interfaces
{
    public interface IEmbeddingService
    {
        int VectorSize { get; }

        /// <summary>
        /// Biến một đoạn văn bản (string) thành một mảng số thực (Vector float[])
        /// </summary>
        Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default);
    }
}
