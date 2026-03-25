using FanPulseApi.Services.Auth;
using FanPulseApi.DTO.Auth;
using Microsoft.AspNetCore.Mvc;

namespace FanPulseApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null) return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result);
    }
}