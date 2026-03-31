namespace Application.DTOs.User
{
    public class AuthOAuthResultDto
    {
        public bool IsSuccess { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public List<string> Roles { get; set; } = new();
        public string ErrorMessage { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
    }
}
