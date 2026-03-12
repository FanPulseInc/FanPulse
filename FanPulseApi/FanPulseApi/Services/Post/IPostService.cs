using FanPulseApi.DTO;
using FanPulseApi.DTO.Post;

namespace FanPulseApi.Services.Post
{
    public interface IPostService
    {
        public Task<PostResponce> AddPost(PostAddRequest payload,Guid userId);

        public Task<PostResponce> UpdatePost(Guid id,PostAddRequest payload);

        public Task<PostResponce> DeletePost(Guid id);

        public Task<IEnumerable<PostResponce>> GetPosts(int page,int count = 20);
     
        public Task<PostResponce> GetPost(Guid id);



    }
}
