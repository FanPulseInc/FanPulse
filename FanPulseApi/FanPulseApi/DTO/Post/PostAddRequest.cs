using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.DTO.Post
{
    public class PostAddRequest
    {
        [Required]   
        public required string Title { get; set; }
        [Required]
        public required string Description { get; set; }

   
    }
}
