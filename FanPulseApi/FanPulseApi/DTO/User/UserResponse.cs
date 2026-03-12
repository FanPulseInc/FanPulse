namespace FanPulseApi.DTO.User;

public class UserResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsVerifiedUser { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}