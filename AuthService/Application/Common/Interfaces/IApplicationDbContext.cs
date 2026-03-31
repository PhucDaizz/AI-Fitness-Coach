using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        public DbSet<ExtendedIdentityUser> Users { get; set; }
        public DbSet<IdentityRole> Roles { get; set; }
        public DbSet<IdentityUserRole<string>> UserRoles { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
