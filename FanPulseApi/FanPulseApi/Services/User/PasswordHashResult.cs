namespace FanPulseApi.Services.User;

public class PasswordHashResult
{
    public byte[] Hash { get; init; }
    public byte[] Salt { get; init; }

    public PasswordHashResult(byte[] hash, byte[] salt)
    {
        Hash = hash;
        Salt = salt;
    }
}