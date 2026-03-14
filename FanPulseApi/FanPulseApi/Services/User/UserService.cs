using FanPulseApi.DTO;
using FanPulseApi.DTO.User;
using FanPulseApi.Models;
using FanPulseApi.Repositories.User;

namespace FanPulseApi.Services.User;

public class UserService: IUserService
{
    private readonly IUserRepository _repository;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUserRepository repository, IPasswordHasher passwordHasher)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
    }

    //Get
    
    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
    {
        var user  = await _repository.GetUserByIdAsync(id);
        return user?.ToDto();
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
        var users = await _repository.GetAllUsersAsync();
        return users.ToDtoList();
    }

    public async Task<UserResponse?> GetUserByEmailAsync(string email)
    {
        var user = await _repository.GetUserByEmailAsync(email);
        return user?.ToDto();
    }

    //Create
    
    public async Task<UserResponse?> AddUserAsync(UserAddRequest addRequest)
    {
        if (addRequest.FavCategoryIds.Count != 2)
        {
            throw new Exception("You must select exactly 2 favorite categories.");
        }
        
        var existingUser = await _repository.GetUserByEmailAsync(addRequest.Email);
        if (existingUser != null)
        {
            return null;
        }
        
        var passwordResult = _passwordHasher.HashPassword(addRequest.Password);
        
        var user = new Models.User
        {
            Id = Guid.NewGuid(),
            Email = addRequest.Email,
            Name = addRequest.Name,
            PasswordHash = passwordResult.Hash,
            PasswordSalt = passwordResult.Salt,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            CreatedBy = "system",
            UpdatedBy = "system" 
        };
        
        //There will be categories soon...
        
        var createdUser = await _repository.CreateUserAsync(user);
        return createdUser.ToDto();
    }

    //Update
    
    public async Task<UserResponse> UpdateUserAsync(Guid userId, UserUpdateRequest request)
    {
        var user = await _repository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return null;
        }
        
        user.Name = request.Name;
        user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        user.UpdatedBy = request.Name;

        var success = await _repository.UpdateUserAsync(user);
        return success ? user.ToDto() : null;
    }
    
    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _repository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        
        var isOldPasswordCorrect = _passwordHasher.VerifyPassword(
            request.CurrentPassword, 
            user.PasswordHash, 
            user.PasswordSalt
        );

        if (!isOldPasswordCorrect)
        {
            return false;
        } 
        
        var passwordResult = _passwordHasher.HashPassword(request.NewPassword);
    
        user.PasswordHash = passwordResult.Hash;
        user.PasswordSalt = passwordResult.Salt;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        user.UpdatedBy = user.Name;
        
        return await _repository.UpdateUserAsync(user);
    }

    //Delete
    
    public async Task<UserResponse?> DeleteUserAsync(Guid id)
    {
        var user = await _repository.GetUserByIdAsync(id);
        if (user == null)
        {
            return null;
        }
        var success = await _repository.DeleteUserAsync(id);
        return success ? user.ToDto() : null;
    }
}