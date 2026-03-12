using FanPulseApi.Data;
using FanPulseApi.Services.User;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Repositories.User;

public class UserRepository : IUserRepository
{
    
    private readonly FanPusleDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UserRepository(FanPusleDbContext context,IPasswordHasher passwordHasher) 
    { 
        _context = context;
        _passwordHasher = passwordHasher;
    }
    
    //Get
    
    public async Task<Models.User?> GetUserByIdAsync(Guid userId)
    {
       return await _context.Users
           .Include(u => u.FavCategories)
           .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<List<Models.User>> GetAllUsersAsync()
    {
        return await _context.Users.AsNoTracking().ToListAsync();
    }
    
    public async Task<Models.User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    // Create
    
    public async Task<Models.User> CreateUserAsync(Models.User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    //Delete
    
    public async Task<bool> DeleteUserAsync(Guid id)
    {
        Models.User? user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return false;
        }
        _context.Users.Remove(user);
        var affectedRows = await _context.SaveChangesAsync();
        return affectedRows > 0;
    }

    //Update
    
    public async Task<bool> UpdateUserAsync(Models.User user)
    {
        _context.Users.Update(user);
        
        var affectedRows = await _context.SaveChangesAsync();
        
        return affectedRows > 0;
    }
    
}