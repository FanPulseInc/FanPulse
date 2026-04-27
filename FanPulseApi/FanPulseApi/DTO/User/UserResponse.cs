namespace FanPulseApi.DTO.User;

public class UserResponse
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsVerifiedUser { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public int? CountOfPosts { get; set; }
    public int? CountOfComments { get; set; }    
    public int? CountOfLkes { get; set; }

    public List<UserActivityDto>? RecentActivities {  get; set; }

}

public class UserActivityDto
{
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}