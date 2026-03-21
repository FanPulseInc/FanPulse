using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.DTO.Category;

public class CategoryAddRequest
{
    [Microsoft.Build.Framework.Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; set; }
    
    public Guid? ParentId { get; set; }
}