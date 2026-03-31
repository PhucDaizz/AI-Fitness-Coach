using Microsoft.AspNetCore.Identity;

namespace Domain.Entities
{
    public class ExtendedIdentityUser : IdentityUser
    {
        public string FullName { get; set; }
        public string AvatarUrl { get; set; }
        public int Follower { get; set; }
        public bool IsActive { get; set; } = true;  
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public bool? Gender { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
