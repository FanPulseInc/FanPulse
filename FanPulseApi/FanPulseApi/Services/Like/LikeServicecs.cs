using FanPulseApi.Data;
using FanPulseApi.Models;
using FanPulseApi.Repositories.Likes;

namespace FanPulseApi.Services.Like
{
    public class LikeServicecs:ILikeService
    {

        private readonly ILikeRepository _repository;

        public LikeServicecs(ILikeRepository repository)
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

        public Task<int> GetCountLikesByCommentId(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task<int> GetCountLikesByPostId(Guid postId)
        {
            throw new NotImplementedException();
        }

        public IQueryable<PostLike> GetLikesByUserId(Guid id)
        {
            throw new NotImplementedException();
        }
    }
}
