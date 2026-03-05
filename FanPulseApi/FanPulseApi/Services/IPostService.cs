using FanPulseApi.DTO;

namespace FanPulseApi.Services
{
    public interface IPostService
    {
        public Task<PostResponce> AddPost(PostAddRequest payload);

        public Task<PostResponce> UpdatePost(Guid id,PostAddRequest payload);

        public Task<PostResponce> DeletePost(Guid id);

        public Task<List<PostResponce>> GetPosts(int page);

        public Task<PostResponce> GetPost(Guid id);



    }
}
