using FanPulseApi.DTO;
using FanPulseApi.DTO.Post;

namespace FanPulseApi.Services.Post
{
    public static class PostMapper
    {
        public static PostResponce ToDto(Models.Post post)
        {
            return new PostResponce
            {
                Description = post.Description,
                Title = post.Title,
                Comments = post.comments ?? null ,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Likes = post.Likes ?? null,
                Id = post.Id,
                User = post.User ?? null, // Should be replaced by UserDto
                UserId = post.UserId != Guid.Empty ? post.UserId : null,

            };
        }

        public static List<PostResponce> ToArrayDto(List<Models.Post> posts)
        {
            var list = new List<PostResponce>();
            foreach (var post in posts) { 
                list.Add(ToDto(post));    
            }
            return list;
        }
     
    }
}
