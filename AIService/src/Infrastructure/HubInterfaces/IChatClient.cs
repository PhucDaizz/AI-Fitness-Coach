namespace AIService.Infrastructure.HubInterfaces
{
    public interface IChatClient
    {
        // 1. Nhận từng mảnh chữ (Dùng cho hiệu ứng gõ phím - SSE Streaming)
        // messageId: Để client biết các chữ này thuộc về tin nhắn nào
        // chunk: Đoạn text nhỏ AI vừa nhả ra
        Task ReceiveMessageChunk(Guid messageId, string chunk);

        // 2. Báo hiệu AI đã trả lời xong một câu
        // Để Frontend biết mà tắt cái animation "AI is typing..."
        Task MessageCompleted(Guid messageId);

        // 3. Nhận toàn bộ tin nhắn 1 lần (Dùng cho tin nhắn hệ thống hoặc chat thông thường không cần streaming)
        Task ReceiveMessage(Guid messageId, string role, string content);

        // 4. Bắn lỗi về cho client nếu AI API sập hoặc hết quota
        Task ReceiveError(string errorMessage);

        Task SessionTitleUpdated(Guid sessionId, string title); 
    }
}
