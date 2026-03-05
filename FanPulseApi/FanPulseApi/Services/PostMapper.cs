using FanPulseApi.DTO;
using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace FanPulseApi.Services
{
    public static class PostMapper
    {
        public static PostResponce ToDto(Post post)
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

        public static List<PostResponce> ToArrayDto(List<Post> posts)
        {
            var list = new List<PostResponce>();
            foreach (var post in posts) { 
                list.Add(ToDto(post));    
            }
            return list;
        }
     
    }
}
