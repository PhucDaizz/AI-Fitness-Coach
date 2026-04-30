namespace AIService.Application.DTOs.Session
{
    public class SessionDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Title { get; set; }
    }
}
