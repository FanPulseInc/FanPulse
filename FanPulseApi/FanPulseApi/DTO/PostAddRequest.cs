using FanPulseApi.Models;
using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.DTO
{
    public class PostAddRequest
    {
        [Required]   
        public required string Title { get; set; }
        [Required]
        public required string Description { get; set; }

   
    }
}
