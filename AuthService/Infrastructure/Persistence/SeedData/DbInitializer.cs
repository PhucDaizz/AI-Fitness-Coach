using Domain.Common;
using Domain.Entities;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Infrastructure.Persistence.SeedData
{
    public class DbInitializer : IDbInitializer
    {
        private readonly UserManager<ExtendedIdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly AdminAccountOptions _adminOptions; 

        public DbInitializer(
            UserManager<ExtendedIdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IOptions<AdminAccountOptions> adminOptions)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _adminOptions = adminOptions.Value;
        }

        public async Task SeedAsync()
        {
            foreach (var roleName in AppRoles.AllRoles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            var adminUser = await _userManager.FindByEmailAsync(_adminOptions.Email);

            if (adminUser == null)
            {
                adminUser = new ExtendedIdentityUser
                {
                    UserName = _adminOptions.Email,
                    Email = _adminOptions.Email,
                    FullName = _adminOptions.FullName,
                    EmailConfirmed = true 
                };

                var result = await _userManager.CreateAsync(adminUser, _adminOptions.Password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, AppRoles.SysAdmin);
                }
            }
        }
    }
}
