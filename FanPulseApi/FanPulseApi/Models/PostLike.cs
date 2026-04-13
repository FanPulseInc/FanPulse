namespace FanPulseApi.Models
{
    public class PostLike
    {
        
        public Guid? Id { get; set; }

        public Guid? UserId { get; set; }
        public Guid? PostId { get; set; }
        public Guid? CommentId { get; set; }

        public Post? Post { get; set; }

        public User? User { get; set; }


        public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();

        

    }
}
