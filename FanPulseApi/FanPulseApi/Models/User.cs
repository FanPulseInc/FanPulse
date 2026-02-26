using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.Models;

public sealed class User
{
    public Guid Id { get; set; }
    
    public required string Email { get; set; }
    
    public required string Name { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    public required byte[] PasswordHash { get; set; }
    
    public required byte[] PasswordSalt { get; set; }
    
    public bool IsVerifiedUser { get; set; } = false;
    
    public bool IsEmailVerified { get; set; }
    
    public bool IsDeleted { get; set; } = false;
    
    public bool IsBanned { get; set; } = false;
    
    public int BanCount { get; set; } = 0;

    public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
    
    public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();

    public required string CreatedBy { get; set; } = "system";
    
    public required string UpdatedBy { get; set; }
    
    public ICollection<Category> FavCategories { get; set; } = new List<Category>();
    
        
}