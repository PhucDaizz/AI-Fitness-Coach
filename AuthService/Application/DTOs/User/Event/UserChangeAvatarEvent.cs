namespace Application.DTOs.User.Event
{
    public class UserChangeAvatarEvent
    {
        public Guid UserId { get; set; }
        public string ImageUrl { get; set; }
    }
}
