namespace Domain.Common
{
    public static class AppRoles
    {
        public const string SysAdmin = "SysAdmin";
        public const string Customer = "Customer";

        public static IEnumerable<string> AllRoles => new[]
        {
            SysAdmin, Customer
        };

        public static readonly Dictionary<string, string> PositionToRoleMap = new()
        {
            { SysAdmin, AppRoles.SysAdmin }
        };

        public static bool IsValidPosition(string position)
        {
            return PositionToRoleMap.ContainsKey(position);
        }

        public static string GetRoleForPosition(string position)
        {
            return PositionToRoleMap.TryGetValue(position, out var role)
                ? role
                : AppRoles.Customer; // Default fallback
        }

        public static bool IsStaffPosition(string position)
        {
            return position != AppRoles.Customer && PositionToRoleMap.ContainsKey(position);
        }
    }
}
