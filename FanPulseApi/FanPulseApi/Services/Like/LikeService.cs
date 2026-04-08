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

        public async Task<PostLike> AddLikeAsync(PostLike postLike)
        { 
            var like = await _repository.AddLikeAsync(postLike);
           return like;

          
        }

        public async Task<bool> DeleteLikeAsync(Guid id)
        {
            var completed = await _repository.DeleteLikeAsync(id);

            return completed ? true : false;


        }

        public async Task<int> GetLikeCountAsync(Guid targetId)
        {
            return await _repository.GetLikeCountAsync(targetId);
        }

        public async Task<bool> IsLikedByUserAsync(Guid targetId, Guid userId)
        {
            return await _repository.IsLikedByUserAsync(targetId, userId);
        }

        public async Task<IEnumerable<PostLike>> GetLikesByTargetIdAsync(Guid targetId)
        {
            return await _repository.GetLikesByTargetIdAsync(targetId);
        }

    }
}
