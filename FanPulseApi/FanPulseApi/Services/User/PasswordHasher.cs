using System.Security.Cryptography;
using System.Text;

namespace FanPulseApi.Services.User;

public class PasswordHasher : IPasswordHasher
{
    public PasswordHashResult HashPassword(string password)
    {
        using HMACSHA512 hmac = new();
        
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        byte[] salt = hmac.Key;

        return new PasswordHashResult(hash, salt);
    }

    public bool VerifyPassword(string password, byte[] hash, byte[] salt)
    {
        using HMACSHA512 hmac = new(salt);
        byte[] computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return CryptographicOperations.FixedTimeEquals(computedHash, hash);
    }
}