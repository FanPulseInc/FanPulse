using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanPulseApi.DTO.Auth;
using FanPulseApi.Repositories.User;
using FanPulseApi.Services.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace FanPulseApi.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;
    private readonly IPasswordHasher _passwordHasher;
    
    public AuthService(IUserRepository userRepository, IConfiguration config, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _config = config;
        _passwordHasher = passwordHasher;
    }
    
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetUserByEmailAsync(request.Email);
        
        if (user == null) return null;
        
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            return null; 
        }
        
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "Temporary_Local_Dev_Key_32_Chars_Long!!!");
            
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
            
        return new AuthResponse
        {
            Token = tokenHandler.WriteToken(token),
            Email = user.Email,
            UserId = user.Id
        };
    }
}