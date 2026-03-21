using FanPulseApi.Data;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Repositories.Category;

public class CategoryRepository : ICategoryRepository
{
    private readonly FanPusleDbContext _context;

    public CategoryRepository(FanPusleDbContext context)
    {
        _context = context;
    }

    //Get
    public async Task<Models.Category?> GetCategoryByIdAsync(Guid categoryId)
    {
        return await _context.Categories
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == categoryId);
    }

    public async Task<List<Models.Category>> GetAllCategoriesAsync()
    {
        return await _context.Categories.AsNoTracking().ToListAsync();
    }
    
    public async Task<List<Models.Category>> GetRootCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => c.ParentId == null)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Models.Category>> GetSubCategoriesAsync(Guid parentId)
    {
        return await _context.Categories
            .Where(c => c.ParentId == parentId)
            .AsNoTracking()
            .ToListAsync();
    }

    //Create
    
    public async Task<Models.Category> CreateCategoryAsync(Models.Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
        return category;
    }
    
    //Delete

    public async Task<bool> DeleteCategoryAsync(Guid id)
    {
        Models.Category? category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return false;
        }
        _context.Categories.Remove(category);
        var affectedRows = await _context.SaveChangesAsync();
        return affectedRows > 0;
    }

    //Update
    
    public async Task<bool> UpdateCategoryAsync(Models.Category category)
    {
        _context.Categories.Update(category);
        
        var affectedRows = await _context.SaveChangesAsync();
        return affectedRows > 0;
    }
    
}