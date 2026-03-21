using FanPulseApi.DTO.Category;

namespace FanPulseApi.Services.Category;

public interface ICategoryService
{
    // Get
    Task<CategoryResponse?> GetCategoryByIdAsync(Guid id);
    
    Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync();
    
    Task<IEnumerable<CategoryResponse>> GetRootCategoriesAsync();
    
    Task <IEnumerable<CategoryResponse>> GetSubCategoriesAsync(Guid parentId);
    
    //Create
    Task<CategoryResponse?> CreateCategoryAsync(CategoryAddRequest request);
    
    //Delete
    public Task<bool> DeleteCategoryAsync(Guid id);
    
    //Update
    public Task<CategoryResponse?> UpdateCategoryAsync(Guid id, CategoryUpdateRequest request);
    
    
}