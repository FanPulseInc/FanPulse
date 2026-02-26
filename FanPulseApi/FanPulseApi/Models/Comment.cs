using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

namespace FanPulseApi.Models
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; }

        public string? PostId { get; set; }
        public Post? Post { get; set; }

        [Required]
        public string CommentText { get; set; }

        public string? ParentId { get; set; }
        public Comment Parent { get; set; }


        public string UserID { get; set; }
        //public string  User { get; set; }



        public DateTimeOffset CreatedAt { get; set; }
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
