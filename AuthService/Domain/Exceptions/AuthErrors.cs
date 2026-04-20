using Domain.Common.Response;

namespace Domain.Exceptions
{
    public static class AuthErrors
    {
        public static readonly Error Unauthorized = new("Auth.Unauthorized", "You need to login to perform this action");
        public static readonly Error ChangePasswordFailed = new("Auth.ChangePasswordFailed", "Failed to change password");
        public static readonly Error InvalidCurrentPassword = new("Auth.InvalidCurrentPassword", "Current password is incorrect");
        public static readonly Error UserNotFound = new("Auth.UserNotFound", "User not found");
    }
}
