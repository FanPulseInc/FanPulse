using FanPulseApi.Data;
using FanPulseApi.Models;
using FanPulseApi.Repositories.Likes;
using System.Threading.Tasks;

namespace FanPulseApi.Services.Like
{
    public class LikeService:ILikeService
    {

        private readonly ILikeRepository _repository;

        public LikeService(ILikeRepository repository)
        {
            _repository = repository;

        }

        public async Task<PostLike> AddLike(PostLike postLike)
        {
          var like = await _repository.AddLike(postLike);
           return like;

          
        }

        public async Task<bool> DeleteLike(Guid id)
        {
            var completed = await _repository.DeleteLike(id);

            return completed ? true : false;


        }

        public  async Task<int> GetCountLikesByCommentId(Guid commentId)
        { 
           var likes = await _repository.GetCountLikesByCommentId(commentId);
           return likes;
        }

        public async Task<int> GetCountLikesByPostId(Guid postId)
        {
            var likes = await _repository.GetCountLikesByPostId(postId);
            return likes;
        }

        public async Task<IQueryable<PostLike>> GetLikesByUserId(Guid id)
        {
            var likes = await GetLikesByUserId(id);
            return likes;
        }

    }
}
