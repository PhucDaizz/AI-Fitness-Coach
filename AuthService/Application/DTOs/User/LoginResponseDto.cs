namespace Application.DTOs.User
{
    public class LoginResponseDto
    {
        public string Token { get; init; }
        public string RefreshToken { get; init; }
    }
}
