using FanPulseApi.DTO.User;
using FanPulseApi.Services.Category;

namespace FanPulseApi.Services.User;

public static class UserMapper
{
    public static UserResponse ToDto(
        this Models.User user,
        List<UserActivityDto>? recentActivities = null)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            IsVerifiedUser = user.IsVerifiedUser,
            CreatedAt = user.CreatedAt,

            CountOfComments = user.Comments?.Count ?? 0,
            CountOfLkes = user.Likes?.Count ?? 0,
            CountOfPosts = user.Posts?.Count ?? 0,

            RecentActivities = recentActivities ?? new List<UserActivityDto>(),
            FavCategories = CategoryMapper.ToDtoList(user.FavCategories)
           
        };
    }

    public static List<UserResponse> ToDtoList(this IEnumerable<Models.User> users)
    {
        return users.Select(user => user.ToDto()).ToList();
    }
}