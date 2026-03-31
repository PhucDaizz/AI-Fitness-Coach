namespace Infrastructure.Settings
{
    public class CloudinarySettings
    {
        public const string SectionName = "Cloudinary";
        public string? CloudName { get; set; }
        public string? ApiKey { get; set; }
        public string? ApiSecret { get; set; }
        public string DefaultFolder { get; set; } = "avatars";
        public int MaxFileSize { get; set; } = 5 * 1024 * 1024; // 5MB
        public string[] AllowedFormats { get; set; } = { "jpg", "jpeg", "png", "gif", "webp" };
        public int AvatarWidth { get; set; } = 300;
        public int AvatarHeight { get; set; } = 300;
        public string Transformation { get; set; } = "c_fill,g_face";
    }
}