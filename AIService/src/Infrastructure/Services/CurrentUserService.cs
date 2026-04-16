using AIService.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AIService.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId =>
            _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;


        public string? UserName =>
            _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.Name)?.Value;

        public string? Email =>
            _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.Email)?.Value;

        public string? Role =>
            _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.Role)?.Value;

        public string? FullName =>
            _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.Name)?.Value;
        public string? PhoneNumber =>
            _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.MobilePhone)?.Value;

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
}
