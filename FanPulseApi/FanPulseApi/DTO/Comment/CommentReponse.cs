using System.ComponentModel.DataAnnotations;
using FanPulseApi.DTO.Post;
using FanPulseApi.DTO.User;

namespace FanPulseApi.DTO.Comment
{
    public class CommentReponse
    {
        [Key]
        public Guid Id { get; set; }

        public PostResponce Post { get; set; }

        [Required]
        public required string CommentText { get; set; }

        public CommentReponse? Parent { get; set; }

        public ICollection<CommentReponse> Children { get; set; } = new List<CommentReponse>();
        public UserResponse User { get; set; }
    }
}
