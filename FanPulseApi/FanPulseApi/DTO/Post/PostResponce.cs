using FanPulseApi.DTO.Category;
using FanPulseApi.DTO.User;
using FanPulseApi.Models;
using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.DTO
{
    public class PostResponce
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public required string Title { get; set; }

        [Required]
        public required string Description { get; set; }

        public Guid UserId { get; set; }
        public UserResponse User { get; set; }

        public CategoryResponse Category { get; set; }

        public ICollection<PostLike> Likes { get; set; }


        public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();


        public List<Models.Comment> Comments { get; set; } = new List<Models.Comment>();


    

    }
}
