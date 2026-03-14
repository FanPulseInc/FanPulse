namespace FanPulseApi.Services.User;

public interface IPasswordHasher
{
    PasswordHashResult HashPassword(string password);
    bool VerifyPassword(string password, byte[] hash, byte[] salt);
}
