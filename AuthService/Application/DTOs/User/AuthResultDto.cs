namespace Application.DTOs.User
{
    public class AuthResultDto
    {
        public bool IsSuccess { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public List<string> Roles { get; set; } = new();
        public string ErrorMessage { get; set; }
    }
}
