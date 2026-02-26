using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.Models
{
    public class Post
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public required string Title { get; set; }

        [Required]
        public required string Description { get; set; }


        public Guid UserId { get; set; }
        public User User { get; set; }

        public ICollection<PostLike> Likes {  get; set; }

       
        public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();


        public List<Comment> comments { get; set; } = new List<Comment>();


        public DateTimeOffset UpdateStamp()
        {
            UpdatedAt = TimeProvider.System.GetUtcNow();
            return UpdatedAt;
        }

        
         
       

    }
}
