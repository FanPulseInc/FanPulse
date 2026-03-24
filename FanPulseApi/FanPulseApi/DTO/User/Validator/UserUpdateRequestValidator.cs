using FluentValidation;

namespace FanPulseApi.DTO.User.Validator;

public class UserUpdateRequestValidator : AbstractValidator<UserUpdateRequest>
{
    public UserUpdateRequestValidator()
    {
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
        
                
        
    }
}