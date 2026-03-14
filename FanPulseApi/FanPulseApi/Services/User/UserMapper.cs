using FanPulseApi.DTO.User;

namespace FanPulseApi.Services.User;

public static class UserMapper
{
    public static UserResponse ToDto(this Models.User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            IsVerifiedUser = user.IsVerifiedUser,
            CreatedAt = user.CreatedAt
        };
    }
    
    public static List<UserResponse> ToDtoList(this IEnumerable<Models.User> users)
    {
        return users.Select(user => user.ToDto()).ToList();
    }
    
}