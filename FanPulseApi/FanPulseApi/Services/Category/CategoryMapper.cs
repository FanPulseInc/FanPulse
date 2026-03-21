using FanPulseApi.DTO.Category;

namespace FanPulseApi.Services.Category;

public static class CategoryMapper
{
    public static CategoryResponse ToDto(this Models.Category category)
    {
        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            ParentId = category.ParentId,
            Children = category.Children != null 
                ? category.Children.Select(c => c.ToDto()).ToList() 
                : new List<CategoryResponse>()

        };
    }
    
    public static List<CategoryResponse> ToDtoList(this IEnumerable<Models.Category> categories)
    {
        if (categories == null)
        {
            return new List<CategoryResponse>();
        }
        
        return categories.Select(c => c.ToDto()).ToList();
    }
    
}