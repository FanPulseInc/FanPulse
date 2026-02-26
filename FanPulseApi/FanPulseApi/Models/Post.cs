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


        public string UserId { get; set; }
        // public string User { get; set; }  nav property

        // public List<string>Likes { get; set; } nav propety to table Likes or well do it with int column 'like'


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
