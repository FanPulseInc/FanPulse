namespace FanPulseApi.DTO.User;

public class UserUpdateRequest
{
    public required string Name { get; set; }
    public string? AvatarUrl { get; set; }
}