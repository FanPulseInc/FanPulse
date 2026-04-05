using FanPulseApi.Models;
using System.Diagnostics.Contracts;

namespace FanPulseApi.Repositories.Likes
{
    public enum LikeTarget
    {
        Post,
        Comment
    }
    
    public interface ILikeRepository
    {
        public Task<PostLike> AddLikeAsync(PostLike postLike);
        public Task<bool> DeleteLikeAsync(Guid id);
        public Task<int> GetLikeCountAsync(Guid targetId); 
        public Task<bool> IsLikedByUserAsync(Guid targetId, Guid userId);
        public Task<IEnumerable<PostLike>> GetLikesByTargetIdAsync(Guid targetId);

       
    }
}
