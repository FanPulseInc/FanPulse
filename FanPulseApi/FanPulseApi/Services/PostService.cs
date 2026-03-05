using FanPulseApi.DTO;
using FanPulseApi.Models;

namespace FanPulseApi.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _repoistory;

        public PostService(IPostRepository repoistory)
        {
            _repoistory = repoistory;
        }

        public async Task<PostResponce> AddPost(PostAddRequest payload)
        {
            var post = await _repoistory.AddPost(payload);
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
            return PostMapper.ToDto(post);
        }

        public async Task<List<PostResponce>> GetPosts(int page,int count=20)
        {
            var posts = await _repoistory.GetPosts(page,count);
            return PostMapper.ToArrayDto(posts);
        }

        public async Task<PostResponce> UpdatePost(Guid id, PostAddRequest payload)
        {
            var updatedPost = _repoistory.UpdatePost(id,payload);
        }
    }
}
