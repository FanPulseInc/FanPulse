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
                Comments = post.comments,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Likes = post.Likes,
                Id = post.Id,
                User = post.User, // Should be replaced by UserDto
                UserId = post.User.Id,
                

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
