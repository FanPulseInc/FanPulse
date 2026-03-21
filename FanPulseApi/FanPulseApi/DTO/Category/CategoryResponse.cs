namespace FanPulseApi.DTO.Category;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid? ParentId { get; set; }
    
    public List<CategoryResponse> Children { get; set; } = new();
}