namespace FanPulseApi.Repositories.Category;

public interface ICategoryRepository
{
    Task<Models.Category?> GetCategoryByIdAsync(Guid categoryId);

    Task<List<Models.Category>> GetAllCategoriesAsync();
    
    Task<Models.Category> CreateCategoryAsync(Models.Category category);
    
    public Task<bool> DeleteCategoryAsync(Guid id);
    
    public Task<bool> UpdateCategoryAsync(Models.Category category);
    
    Task<List<Models.Category>> GetRootCategoriesAsync();
    
    Task<List<Models.Category>> GetSubCategoriesAsync(Guid parentId);
}