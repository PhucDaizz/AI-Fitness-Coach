namespace Infrastructure.Common.Cloudinary
{
    public class CloudinaryDeletionResult
    {
        public string PublicId { get; set; }
        public bool IsDeleted { get; set; }
        public string Result { get; set; }
        public string Error { get; set; }
    }
}
