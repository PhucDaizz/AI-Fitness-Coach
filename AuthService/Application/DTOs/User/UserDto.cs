namespace Application.DTOs.User
{
    public class UserDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string AvatarUrl { get; set; }
        public bool IsActive { get; set; }
        public bool? Gender { get; set; }
        public string Role { get; set; }
    }
}
