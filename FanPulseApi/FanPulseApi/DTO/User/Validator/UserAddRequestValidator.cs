using FluentValidation;

namespace FanPulseApi.DTO.User.Validator;

public class UserAddRequestValidator : AbstractValidator<UserAddRequest>
{
    public UserAddRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .WithMessage("Name cannot exceed 100 characters");
        
        RuleFor(x => x.AvatarUrl)
            .Must(url => string.IsNullOrEmpty(url) || 
                         url.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) || 
                         url.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) || 
                         url.EndsWith(".png", StringComparison.OrdinalIgnoreCase) || 
                         url.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Avatar URL must point to a valid image format (.jpg, .png, .webp).");
        
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special symbol")
            .Must(pass => pass.All(c => c > 32 && c < 128))
            .WithMessage(
                "Password contains invalid characters. Only standard English characters and symbols are allowed.");
        
    }
}