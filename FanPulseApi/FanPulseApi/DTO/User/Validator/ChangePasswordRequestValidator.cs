using FluentValidation;

namespace FanPulseApi.DTO.User.Validator;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("You must provide your current password.");
        
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special symbol")
            .Must(pass => pass.All(c => c > 32 && c < 128))
            .WithMessage(
                "Password contains invalid characters. Only standard English characters and symbols are allowed.");
        
        RuleFor(x => x.NewPassword)
            .NotEqual(x => x.CurrentPassword)
            .WithMessage("Your new password cannot be the same as your current password.");
    }
}