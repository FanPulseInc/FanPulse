using FanPulseApi.Models;

namespace FanPulseApi.Services.Like
{
    public interface ILikeService
    {
        public Task<PostLike> AddLikeAsync(PostLike postLike);
        public Task<bool> DeleteLikeAsync(Guid id);
        public Task<int> GetLikeCountAsync(Guid targetId); 
        public Task<bool> IsLikedByUserAsync(Guid targetId, Guid userId);
        public Task<IEnumerable<PostLike>> GetLikesByTargetIdAsync(Guid targetId);

    }
}
