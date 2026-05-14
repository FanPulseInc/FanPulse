using FanPulseApi.DTO;
using FanPulseApi.DTO.User;
using FanPulseApi.Models;
using FanPulseApi.Repositories.Category;
using FanPulseApi.Repositories.User;
using FanPulseApi.Services.Email;
using FluentValidation;
using System.Security.Cryptography;
using System.Text;

namespace FanPulseApi.Services.User;

public class UserService: IUserService
{
    private readonly IUserRepository _repository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IValidator<UserAddRequest> _validator;
    private readonly IValidator<UserUpdateRequest> _updateValidator;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public UserService(
     IUserRepository repository,
     IValidator<UserAddRequest> validator,
     IPasswordHasher passwordHasher,
     ICategoryRepository categoryRepository,
     IEmailSender emailSender,
     IConfiguration configuration)
    {
        _repository = repository;
        _validator = validator;
        _passwordHasher = passwordHasher;
        _categoryRepository = categoryRepository;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    //Get

    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
{
    var user = await _repository.GetUserByIdAsync(id);

    if (user == null)
    {
        return null;
    }

    var recentActivities = (user.Posts ?? new List<Models.Post>())
        .Select(p => new UserActivityDto
        {
            Type = "Пост",
            Title = p.Title,
            CreatedAt = p.CreatedAt
        })
        .Concat((user.Comments ?? new List<Models.Comment>())
            .Select(c => new UserActivityDto
            {
                Type = "Коментар",
                Title = c.CommentText,
                CreatedAt = c.CreatedAt
            }))
        .Concat((user.Likes ?? new List<Models.PostLike>())
            .Select(l => new UserActivityDto
            {
                Type = "Лайк",
                Title = l.Post?.Title ?? "Пост",
                CreatedAt = l.CreatedAt
            }))
        .OrderByDescending(x => x.CreatedAt)
        .Take(3)
        .ToList();

    return user.ToDto(recentActivities);
}

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
        var users = await _repository.GetAllUsersAsync();
        return users.ToDtoList();
    }

    public async Task<UserResponse?> GetUserByEmailAsync(string email)
    {
        var user = await _repository.GetUserByEmailAsync(email);
        return user?.ToDto();
    }

    //Create

    public async Task<UserResponse?> AddUserAsync(UserAddRequest addRequest)
    {
        var validationResult = await _validator.ValidateAsync(addRequest);

        if (!validationResult.IsValid)
        {
            var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
            throw new ValidationException(errors);
        }
        
        if (addRequest.FavCategoryIds.Count < 1 || addRequest.FavCategoryIds.Count > 2)
        {
            throw new Exception("You must select 1 or 2 favorite categories.");
        }

        var existingUser = await _repository.GetUserByEmailAsync(addRequest.Email);
        if (existingUser != null)
        {
            return null;
        }

        var categories = new List<Models.Category>();

        foreach (var categoryId in addRequest.FavCategoryIds)
        {
            var category = await _categoryRepository.GetCategoryByIdAsync(categoryId);

            if (category == null)
            {
                throw new Exception($"Category with ID {categoryId} not found.");
            }

            categories.Add(category);
        }

        var passwordResult = _passwordHasher.HashPassword(addRequest.Password);

        var rawEmailVerificationToken = Guid.NewGuid().ToString("N");

        var emailVerificationTokenHash = Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(rawEmailVerificationToken))
        );

        var user = new Models.User
        {
            Id = Guid.NewGuid(),
            Email = addRequest.Email,
            Name = addRequest.Name ?? null,
            AvatarUrl = addRequest.AvatarUrl,
            PasswordHash = passwordResult.Hash,
            PasswordSalt = passwordResult.Salt,

            IsVerifiedUser = false,
            EmailVerificationTokenHash = emailVerificationTokenHash,
            EmailVerificationTokenExpiresAt = DateTimeOffset.UtcNow.AddHours(24),

            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            CreatedBy = "system",
            UpdatedBy = "system",

            FavCategories = categories
        };

        var createdUser = await _repository.CreateUserAsync(user);

        var appBaseUrl = _configuration["AppBaseUrl"];

        var confirmUrl =
            $"{appBaseUrl}/api/User/confirm-email?token={rawEmailVerificationToken}";

        await _emailSender.SendEmailAsync(
            createdUser.Email,
            "Підтвердження реєстрації FanPulse",
            $@"
<!DOCTYPE html>
<html lang=""uk"">
  <body style=""margin:0;padding:0;background:#e6e6e6;font-family:Arial,sans-serif;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
      <tr>
        <td align=""center"" style=""padding:40px 16px;"">
          <table
            width=""100%""
            cellpadding=""0""
            cellspacing=""0""
            style=""
              max-width:620px;
              background:#ffffff;
              border-radius:28px;
              overflow:hidden;
              border:3px solid #af292a;
            ""
          >
            <tr>
              <td
                align=""center""
                style=""
                  background:#af292a;
                  padding:42px 20px;
                ""
              >
                <div
                  style=""
                    display:inline-block;
                    margin-bottom:28px;
                    font-family:Arial,sans-serif;
                    font-size:48px;
                    line-height:1;
                    font-weight:900;
                    font-style:italic;
                    letter-spacing:-2px;
                    color:#212121;
                  ""
                >
                  FP
                  <span style=""margin-left:10px;""> FanPulse </span>
                </div>

                <img
                  src=""https://main.d2pc57axofhk5v.amplifyapp.com/icons/fox.png""
                  alt=""FanPulse Fox""
                  width=""180""
                  style=""
                    display:block;
                    filter:drop-shadow(0 10px 24px rgba(0,0,0,0.25));
                  ""
                />
              </td>
            </tr>

            <tr>
              <td style=""padding:40px 36px;"">
                <h1
                  style=""
                    margin:0 0 18px;
                    color:#212121;
                    font-size:34px;
                    line-height:1.1;
                    font-weight:900;
                    text-transform:uppercase;
                  ""
                >
                  Підтвердіть вашу пошту
                </h1>

                <p
                  style=""
                    margin:0 0 28px;
                    color:#212121cc;
                    font-size:16px;
                    line-height:1.7;
                  ""
                >
                  Дякуємо за реєстрацію у FanPulse.
                  Для завершення створення акаунта підтвердіть вашу електронну адресу.
                </p>

                <a
                  href=""{confirmUrl}""
                  style=""
                    display:inline-block;
                    background:#af292a;
                    color:#ffffff;
                    padding:16px 34px;
                    border-radius:999px;
                    font-size:14px;
                    font-weight:800;
                    text-decoration:none;
                    text-transform:uppercase;
                    letter-spacing:0.06em;
                  ""
                >
                  Підтвердити Email
                </a>

                <p
                  style=""
                    margin:32px 0 0;
                    color:#21212188;
                    font-size:13px;
                    line-height:1.7;
                  ""
                >
                  Посилання дійсне протягом 24 годин.
                </p>
              </td>
            </tr>

            <tr>
              <td
                style=""
                  padding:24px 36px;
                  background:#212121;
                ""
              >
                <p
                  style=""
                    margin:0;
                    color:#ffffff99;
                    font-size:12px;
                    line-height:1.6;
                    text-align:center;
                  ""
                >
                  FanPulse © 2026 · Sports & Esports Community Platform
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"
        );

        return createdUser.ToDto();
    }

    //Update

    public async Task<UserResponse?> UpdateUserAsync(Guid userId, UserUpdateRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var user = await _repository.GetUserByIdAsync(userId);

        if (user == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            user.Name = request.Name;
            user.UpdatedBy = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        user.UpdatedAt = DateTimeOffset.UtcNow;

        var success = await _repository.UpdateUserAsync(user);

        return success ? user.ToDto() : null;
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _repository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return false;
        }
        
        var isOldPasswordCorrect = _passwordHasher.VerifyPassword(
            request.CurrentPassword, 
            user.PasswordHash, 
            user.PasswordSalt
        );

        if (!isOldPasswordCorrect)
        {
            return false;
        } 
        
        var passwordResult = _passwordHasher.HashPassword(request.NewPassword);
    
        user.PasswordHash = passwordResult.Hash;
        user.PasswordSalt = passwordResult.Salt;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        user.UpdatedBy = user.Name;
        
        return await _repository.UpdateUserAsync(user);
    }

    //Delete

    public async Task<bool> ConfirmEmailAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        var tokenHash = Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(token))
        );

        var user = await _repository.GetUserByEmailVerificationTokenHashAsync(tokenHash);

        if (user == null)
        {
            return false;
        }

        if (user.EmailVerificationTokenExpiresAt == null ||
            user.EmailVerificationTokenExpiresAt < DateTimeOffset.UtcNow)
        {
            return false;
        }

        if (user.IsVerifiedUser)
        {
            return true;
        }

        user.IsVerifiedUser = true;
        user.EmailVerificationTokenHash = null;
        user.EmailVerificationTokenExpiresAt = null;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        user.UpdatedBy = "email-confirmation";

        await _repository.UpdateUserAsync(user);

        return true;
    }

    public async Task<UserResponse?> DeleteUserAsync(Guid id)
    {
        var user = await _repository.GetUserByIdAsync(id);
        if (user == null)
        {
            return null;
        }
        var success = await _repository.DeleteUserAsync(id);
        return success ? user.ToDto() : null;
    }

    public async Task<UserResponse?> UpdateUserCategoriesAsync(
    Guid id,
    UserCategoriesUpdateRequest request
)
    {
        var user = await _repository.UpdateUserCategoriesAsync(
            id,
            request.FavCategoryIds
        );

        if (user == null)
        {
            return null;
        }

        return UserMapper.ToDto(user);
    }
}