using FanPulseApi.Models;
using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.DTO
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
        public User User { get; set; }
    }
}
