using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.Models
{
    public class Role
    {
        [Key]
        public string Id { get; set; }

        [Required]
        public string RoleName { get; set; }

        
        public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();

    }
}
