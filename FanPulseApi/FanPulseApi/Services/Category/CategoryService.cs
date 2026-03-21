using FanPulseApi.DTO.Category;
using FanPulseApi.Repositories.Category;

namespace FanPulseApi.Services.Category;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }
    
    // Get
    
    public async Task<CategoryResponse?> GetCategoryByIdAsync(Guid id)
    {
        var category = await _repository.GetCategoryByIdAsync(id);
        return category?.ToDto();
    }

    public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync()
    {
        var categories = await _repository.GetAllCategoriesAsync();
        return categories.ToDtoList();
    }

    public async Task<IEnumerable<CategoryResponse>> GetRootCategoriesAsync()
    {
        var roots = await _repository.GetRootCategoriesAsync();
        return roots.ToDtoList();
    }

    public async Task<IEnumerable<CategoryResponse>> GetSubCategoriesAsync(Guid parentId)
    {
        var subs = await _repository.GetSubCategoriesAsync(parentId);
        return subs.ToDtoList();
    }

    //Create
    
    public async Task<CategoryResponse?> CreateCategoryAsync(CategoryAddRequest request)
    {
        var category = new Models.Category 
        { 
            Id = Guid.NewGuid(),
            Name = request.Name,
            ParentId = request.ParentId
        };

        var created = await _repository.CreateCategoryAsync(category);
        return created.ToDto();
    }

    //Delete
    
    public async Task<bool> DeleteCategoryAsync(Guid id)
    {
        return await _repository.DeleteCategoryAsync(id);
    }

    //Update
    
    public async Task<CategoryResponse?> UpdateCategoryAsync(Guid id, CategoryUpdateRequest request)
    {
        var existing = await _repository.GetCategoryByIdAsync(id);
        if (existing == null) return null;

        existing.Name = request.Name;
        existing.ParentId = request.ParentId;

        await _repository.UpdateCategoryAsync(existing);
        return existing.ToDto();
    }
}