using FanPulseApi.DTO;
using Microsoft.AspNetCore.Authentication.OAuth.Claims;

namespace FanPulseApi.Models
{
    public interface IPostRepository
    {
        public Task<List<Post>> GetPosts(int startFrom, int count);

        public Task<Post> AddPost(PostAddRequest payload);

        public Task<Post> GetPostById(Guid id);

        public Task<Post> DeletePost(Guid id);

        public Task<Post> UpdatePost(Guid postId,Post post);


      
    }
}
