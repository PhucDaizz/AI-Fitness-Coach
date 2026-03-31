using MediatR;
using System.Text.Json.Serialization;

namespace Application.DTOs.User
{
    public record SendEmailConfirmation : INotification
    {
        [JsonPropertyName("userId")]
        public required string UserId { get; init; }
        [JsonPropertyName("email")]
        public required string Email { get; init; }
        [JsonPropertyName("fullName")]
        public string? FullName { get; init; }
    }
}
