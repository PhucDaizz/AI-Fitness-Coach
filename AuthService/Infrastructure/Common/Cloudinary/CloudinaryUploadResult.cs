namespace Infrastructure.Common.Cloudinary
{
    public class CloudinaryUploadResult
    {
        public string PublicId { get; set; }
        public string Url { get; set; }
        public string SecureUrl { get; set; }
        public string Format { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public long Bytes { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ResourceType { get; set; }
        public Dictionary<string, string> Tags { get; set; } = new();
        public string Signature { get; set; }
        public string Version { get; set; }

        // Helper methods
        public string GetThumbnailUrl(int width = 100, int height = 100)
        {
            if (string.IsNullOrEmpty(PublicId)) return SecureUrl;

            var urlParts = SecureUrl.Split(new[] { "/upload/" }, StringSplitOptions.None);
            if (urlParts.Length != 2) return SecureUrl;

            return $"{urlParts[0]}/upload/w_{width},h_{height},c_fill/{urlParts[1]}";
        }
    }
}
