using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.DTO
{
    public class CommentAddRequest
    {
        [Required]
        public string CommentText {  get; set; }

        [Required]
        public Guid PostId { get; set; }

        
        public Guid? ParrentId { get; set; }

    }
}
