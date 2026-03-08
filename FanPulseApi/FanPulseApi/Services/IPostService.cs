using FanPulseApi.DTO;

namespace FanPulseApi.Services
{
    public interface IPostService
    {
        public Task<PostResponce> AddPost(PostAddRequest payload,Guid userId);

        public Task<PostResponce> UpdatePost(Guid id,PostAddRequest payload);

        public Task<PostResponce> DeletePost(Guid id);

        public Task<IEnumerable<PostResponce>> GetPosts(int page);

        public Task<PostResponce> GetPost(Guid id);



    }
}
