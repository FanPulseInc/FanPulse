using FanPulseApi.Data;
using FanPulseApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Repositories.Likes
{
    public class LikeRepository : ILikeRepository
    {
        private readonly FanPusleDbContext _context;

        public LikeRepository(FanPusleDbContext context)
        {
            _context = context;
        }

        public async Task<PostLike> AddLikeAsync(PostLike postLike)
        {
            var like = await  _context.PostLikes.AddAsync(postLike);
            await _context.SaveChangesAsync();
            return like.Entity;
        }

        public async  Task<bool> DeleteLikeAsync(Guid id)
        {

            var like = await _context.PostLikes.FindAsync(id);
            if (like == null) return false;
            _context.Remove(await _context.PostLikes.FindAsync(id));
            await _context.SaveChangesAsync();
            return true;

        }


        public async Task<int> GetLikeCountAsync(Guid targetId)
        {
            var likes = await _context.PostLikes
                .CountAsync(l => l.PostId == targetId || l.CommentId == targetId);
            return likes;
        }

        public async Task<bool> IsLikedByUserAsync(Guid targetId, Guid userId)
        {
            var isLiked = await _context.PostLikes
                .AnyAsync(l => l.UserId == userId && (l.PostId == targetId || l.CommentId == targetId));
            return isLiked;
        }

        public async Task<IEnumerable<PostLike>> GetLikesByTargetIdAsync(Guid targetId)
        {
            return await _context.PostLikes
                .Where(l => l.PostId == targetId || l.CommentId == targetId)
                .ToListAsync();
        }
    }
}
