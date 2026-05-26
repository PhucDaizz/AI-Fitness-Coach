using AIService.Application.Common.Contexts;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;

namespace AIService.Infrastructure.ExternalServices
{
    public class TokenForwardingHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TokenForwardingHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var token = AccessTokenHolder.Current;
            var httpContext = _httpContextAccessor.HttpContext;

            if (string.IsNullOrEmpty(token) && httpContext != null)
            {
                var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    token = authHeader.Substring("Bearer ".Length).Trim();
                }
                else if (httpContext.Request.Query.TryGetValue("access_token", out var queryToken))
                {
                    token = queryToken;
                }
            }

            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            return await base.SendAsync(request, cancellationToken);
        }
    }
}
