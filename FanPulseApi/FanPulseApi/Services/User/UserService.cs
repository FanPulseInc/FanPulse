using FanPulseApi.DTO;
using FanPulseApi.DTO.User;
using FanPulseApi.Models;
using FanPulseApi.Repositories.Category;
using FanPulseApi.Repositories.User;
using FluentValidation;

namespace FanPulseApi.Services.User;

public class UserService: IUserService
{
    private readonly IUserRepository _repository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IValidator<UserAddRequest> _validator;
    private readonly IValidator<UserUpdateRequest> _updateValidator;

    public UserService(IUserRepository repository, 
        IPasswordHasher passwordHasher, 
        ICategoryRepository categoryRepository,
        IValidator<UserAddRequest> validator,
        IValidator<UserUpdateRequest> updateValidator)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
        _categoryRepository =  categoryRepository;
        _validator = validator;
        _updateValidator = updateValidator;
    }

    //Get
    
    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
    {
        var user  = await _repository.GetUserByIdAsync(id);
        var recentActivities = user.Posts
        .Select(p => new UserActivityDto
        {
        Type = "Пост",
        Title = p.Title,
        CreatedAt = p.CreatedAt
        })
        .Concat(user.Comments.Select(c => new UserActivityDto
       {
        Type = "Коментар",
        Title = c.CommentText,
        CreatedAt = c.CreatedAt
    }))
    .Concat(user.Likes.Select(l => new UserActivityDto
    {
        Type = "Лайк",
        Title = l.Post.Title,
        CreatedAt = l.CreatedAt
    }))
    .OrderByDescending(x => x.CreatedAt)
    .Take(3)
    .ToList();

        return user?.ToDto(recentActivities);
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
            //Exception can be changed
            var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
            throw new ValidationException(errors); 
        }
        
        if (addRequest.FavCategoryIds.Count != 2)
        {
            throw new Exception("You must select exactly 2 favorite categories.");
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
        
        var user = new Models.User
        {
            Id = Guid.NewGuid(),
            Email = addRequest.Email,
            Name = addRequest.Name??null,
            AvatarUrl = addRequest.AvatarUrl,
            PasswordHash = passwordResult.Hash,
            PasswordSalt = passwordResult.Salt,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            CreatedBy = "system",
            UpdatedBy = "system",
            
            FavCategories = categories
        };
        
        
        var createdUser = await _repository.CreateUserAsync(user);
        return createdUser.ToDto();
    }

    //Update
    
    public async Task<UserResponse> UpdateUserAsync(Guid userId, UserUpdateRequest request)
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
        
        user.Name = request.Name;
        user.AvatarUrl = request.AvatarUrl;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        user.UpdatedBy = request.Name;

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
}