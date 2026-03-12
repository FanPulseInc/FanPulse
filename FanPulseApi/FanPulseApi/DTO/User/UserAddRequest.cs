namespace FanPulseApi.DTO.User;

public class UserAddRequest
{
    public required string Email { get; set; }
    public required string Name { get; set; }
    public required string Password { get; set; } 
    public string? AvatarUrl { get; set; }
    
    public List<Guid> FavCategoryIds { get; set; } = new();
}