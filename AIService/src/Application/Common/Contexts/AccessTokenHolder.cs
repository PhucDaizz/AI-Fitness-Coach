namespace AIService.Application.Common.Contexts
{
    public static class AccessTokenHolder
    {
        private static readonly AsyncLocal<string?> _current = new();
        private static readonly AsyncLocal<string?> _currentUserId = new();

        public static string? Current
        {
            get => _current.Value;
            set => _current.Value = value;
        }

        public static string? CurrentUserId
        {
            get => _currentUserId.Value;
            set => _currentUserId.Value = value;
        }
    }
}
