using Microsoft.AspNetCore.Http.Timeouts;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

namespace FanPulseApi.Models
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; }

        public Guid? PostId { get; set; }
        public Post? Post { get; set; }

        [Required]
        public required string CommentText { get; set; }

        public Guid? ParentId { get; set; }
        public Comment Parent { get; set; }

        public ICollection<Comment> Children { get; set; } = new List<Comment>();



        public Guid UserId { get; set; }
        public User User { get; set; }



        public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();


        public bool IsReply()
        {
           return ParentId != null;
        }

        public DateTimeOffset UpdateStamp()
        {
            UpdatedAt = TimeProvider.System.GetUtcNow();
            return UpdatedAt;
        }

   



    }
}
