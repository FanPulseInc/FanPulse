namespace FanPulseApi.DTO.Auth;

public class AuthResponse
{
    public required string Token { get; set; }
    public required string Email { get; set; }
    public Guid UserId { get; set; }
}