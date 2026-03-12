using FanPulseApi.DTO;
using FanPulseApi.DTO.User;

namespace FanPulseApi.Services.User;

public interface IUserService
{
    // Get
    Task<UserResponse?> GetUserByIdAsync(Guid id);
    Task<IEnumerable<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetUserByEmailAsync(string email);
    //Create
    Task<UserResponse?> AddUserAsync(UserAddRequest addRequest);
    //Update
    Task<UserResponse> UpdateUserAsync(Guid userId, UserUpdateRequest request);
    
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    
    //Delete
    Task<UserResponse?> DeleteUserAsync(Guid id);
    
}