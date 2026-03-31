using Domain.Common.Response;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.User.Commands.UploadAvatar
{
    public class UploadAvatarCommand: IRequest<Result<UploadAvatarResult>>
    {
        [Required]
        public IFormFile File { get; set; }
        public string UserId { get; set; } 
        public string Folder { get; set; } = "avatars";
        public bool DeleteOldAvatar { get; set; } = true;
        public bool OptimizeImage { get; set; } = true;
    }

    public class UploadAvatarResult
    {
        public string PublicId { get; set; }
        public string Url { get; set; }
        public string ThumbnailUrl { get; set; }
        public string OldAvatarPublicId { get; set; }
        public bool OldAvatarDeleted { get; set; }
        public string UserId { get; set; }
        public DateTime UploadedAt { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
    }
}
