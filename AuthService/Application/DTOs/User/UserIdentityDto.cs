namespace Application.DTOs.User
{
    public class UserIdentityDto
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
