namespace FanPulseApi.Repositories.User;

public interface IUserRepository
{
    Task<Models.User?> GetUserByIdAsync(Guid userId);

    Task<List<Models.User>> GetAllUsersAsync();
    
    Task<Models.User> CreateUserAsync(Models.User user);
    
    public Task<bool> DeleteUserAsync(Guid id);
    
    public Task<bool> UpdateUserAsync(Models.User user);
    
    Task<Models.User?> GetUserByEmailAsync(string email);

}