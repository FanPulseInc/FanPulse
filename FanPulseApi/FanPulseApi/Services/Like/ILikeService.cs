using FanPulseApi.Models;

namespace FanPulseApi.Services.Like
{
    public interface ILikeService
    {
        public Task<PostLike> AddLike(PostLike postLike);
        public Task<bool> DeleteLike(Guid id);
        public IQueryable<PostLike> GetLikesByUserId(Guid id);

        public Task<int> GetCountLikesByPostId(Guid postId);
        // Dont like this approach, should to think about how to handle in 1 method for Posts and Comments
        public Task<int> GetCountLikesByCommentId(Guid commentId);

    }
}
