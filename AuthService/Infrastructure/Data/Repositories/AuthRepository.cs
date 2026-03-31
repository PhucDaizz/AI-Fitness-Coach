using Application.Common.Interfaces;
using Application.DTOs.User;
using Application.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IApplicationDbContext _dbContext;

        public AuthRepository(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserIdentityDto?> FindByEmailAsync(string email)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user != null ? new UserIdentityDto
            {
                Id = user.Id,
                Email = user.Email,
            } : null;
        }
        // new

        public async Task<ExtendedIdentityUser?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }

        public async Task<ExtendedIdentityUser?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public Task<List<ExtendedIdentityUser>> GetUsersAsync(CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateUserAsync(ExtendedIdentityUser user, CancellationToken cancellationToken = default)
        {
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken);
        }
    }
}
