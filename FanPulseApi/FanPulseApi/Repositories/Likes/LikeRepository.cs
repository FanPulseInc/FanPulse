using FanPulseApi.Data;
using FanPulseApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace FanPulseApi.Repositories.Likes
{
    public class LikeRepository : ILikeRepository
    {
        private readonly FanPusleDbContext _context;

        public LikeRepository(FanPusleDbContext context)
        {
            _context = context;
        }

        public async Task<PostLike> AddLike(PostLike postLike)
        {
            var like = await  _context.PostLikes.AddAsync(postLike);
            await _context.SaveChangesAsync();
            return like.Entity;
        }

        public async  Task<bool> DeleteLike(Guid id)
        {

            var like = await _context.PostLikes.FindAsync(id);
            if (like == null) return false;
            _context.Remove(await _context.PostLikes.FindAsync(id));
            await _context.SaveChangesAsync();
            return true;

        }

        public Task<int> GetCountLikesByCommentId(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task<int> GetCountLikesByPostId(Guid postId)
        {
            throw new NotImplementedException();
        }

        public  IQueryable<PostLike> GetLikesByUserId(Guid id)
        {
            return _context.PostLikes.Where(i => i.UserId == id);
           
        }
    }
}
