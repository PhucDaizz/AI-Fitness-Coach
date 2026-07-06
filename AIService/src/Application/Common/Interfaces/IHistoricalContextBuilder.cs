namespace AIService.Application.Common.Interfaces
{
    public interface IHistoricalContextBuilder
    {
        /// <summary>
        /// Xây dựng ngữ cảnh lịch sử tập luyện cho người dùng dựa trên userId
        /// Dữ liệu này sẽ được sử dụng làm context cho AI khi tạo kế hoạch tập mới
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="ct"></param>
        /// <returns></returns>
        Task<string> BuildAsync(string userId, CancellationToken ct);
    }
}
