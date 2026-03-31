using Application.Common.Interfaces;
using Application.Contracts;
using Application.DTOs.User;
using Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Contracts
{
    public class JwtTokenGenerator : ITokenGenerator
    {
        private readonly IOptions<JwtSettings> _jwtOptions;
        private readonly IApplicationDbContext _dbContext;
        private readonly IUnitOfWork _unitOfWork;

        public JwtTokenGenerator(IOptions<JwtSettings> jwtOptions, IApplicationDbContext dbContext, IUnitOfWork unitOfWork)
        {
            _jwtOptions = jwtOptions;
            _dbContext = dbContext;
            _unitOfWork = unitOfWork;
        }
        public async Task<string> CreateToken(CreateTokenDTO user, List<string> roles)
        {
            var userInfo = await _unitOfWork.Auth.GetUserByIdAsync(user.UserId);

            var claim = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.UserId),
                new Claim(ClaimTypes.Name, userInfo.FullName ?? "Unknown User"),
                new Claim(ClaimTypes.MobilePhone, userInfo.PhoneNumber ?? "Unknown"),
            };
            foreach (var role in roles)
            {
                claim.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Value.Key));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Value.Issuer,
                audience: _jwtOptions.Value.Audience,
                claims: claim,
                expires: DateTime.UtcNow.AddMinutes(_jwtOptions.Value.TokenExpiryMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomnumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomnumber);
            return Convert.ToBase64String(randomnumber);
        }

        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Value.Key)),
                ValidateLifetime = false,
                ValidIssuer = _jwtOptions.Value.Issuer,
                ValidAudience = _jwtOptions.Value.Audience
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }
                return principal;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
