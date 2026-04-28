namespace AIService.Application.Common.Contexts
{
    public static class AccessTokenHolder
    {
        private static readonly AsyncLocal<string?> _current = new();
        public static string? Current
        {
            get => _current.Value;
            set => _current.Value = value;
        }
    }
}
