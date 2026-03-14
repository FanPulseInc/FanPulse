using FanPulseApi.DTO;
using FanPulseApi.DTO.Post;
using Microsoft.AspNetCore.Authentication.OAuth.Claims;

namespace FanPulseApi.Models
{
    public interface IPostRepository
    {
        public Task<IEnumerable<Post>> GetPosts(int startFrom, int count);

        public Task<Post> AddPost(PostAddRequest payload,Guid userId);

        public Task<Post> GetPostById(Guid id);

        public Task<Post> DeletePost(Guid id);

        public Task<Post> UpdatePost(Guid postId,PostAddRequest post);
        

      
    }
}
