namespace FanPulseApi.DTO.User;

public class UserCategoriesUpdateRequest
{
    public List<Guid> FavCategoryIds { get; set; } = new();
}