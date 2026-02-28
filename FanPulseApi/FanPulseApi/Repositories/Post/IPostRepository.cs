using Microsoft.AspNetCore.Authentication.OAuth.Claims;

namespace FanPulseApi.Models
{
    public interface IPostRepository
    {
        public Task<List<Post>> GetPosts(int startFrom, int count);

        public Task<Post> GetPostById(Guid id);

        public Task<bool> DeletePost(Guid id);

        public Task<Post> UpdatePost(Guid postId,Post post);


      
    }
}
