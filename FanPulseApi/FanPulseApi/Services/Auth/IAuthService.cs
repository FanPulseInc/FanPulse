using FanPulseApi.DTO.Auth;

namespace FanPulseApi.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}