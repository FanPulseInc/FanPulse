using FanPulseApi.DTO;
using FanPulseApi.DTO.Post;
using FanPulseApi.Models;

namespace FanPulseApi.Services.Post
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _repoistory;

        public PostService(IPostRepository repoistory)
        {
            _repoistory = repoistory;
        }

        public async Task<PostResponce> AddPost(PostAddRequest payload,Guid userId)
        {
            var post = await _repoistory.AddPost(payload,userId);
            return PostMapper.ToDto(post);
          
        }

        public async Task<PostResponce> DeletePost(Guid id)
        {
            var post = await _repoistory.DeletePost(id);
            return PostMapper.ToDto(post);
            

        }

        public async Task<PostResponce> GetPost(Guid id)
        {
            var post = await _repoistory.GetPostById(id);
            if (post == null) return null;
            return PostMapper.ToDto(post);
            
        }

        public async Task<IEnumerable<PostResponce>> GetPosts(int page,int count = 20)
        {
            var posts = await _repoistory.GetPosts(page,count);
            return PostMapper.ToArrayDto(posts.ToList());
            
            
        }

      

        public async Task<PostResponce> UpdatePost(Guid id, PostAddRequest payload)
        {
            var updatedPost = await _repoistory.UpdatePost(id, payload);
            return PostMapper.ToDto(updatedPost);
        }

      
    }
}
