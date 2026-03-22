using FanPulseApi.DTO;
using FanPulseApi.DTO.Post;
using FanPulseApi.Services.User;

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
                Comments = post.comments ?? null,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Likes = post.Likes ?? null,
                Id = post.Id,
                User = UserMapper.ToDto(post.User),  
                UserId = post.UserId != Guid.Empty ? post.UserId : Guid.Empty

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
