using FanPulseApi.Data;
using FanPulseApi.DTO;
using FanPulseApi.DTO.Post;
using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Expressions.Internal;

namespace FanPulseApi.Repositories
{
    public class PostRepository : IPostRepository
    {
        private readonly FanPusleDbContext _context;

        public PostRepository(FanPusleDbContext context) 
        { 
            _context = context;
        }

        public async Task<Post> AddPost(PostAddRequest payload,Guid userId)
        {
            var post = await _context.Posts.AddAsync(new Post()
            {
                Description = payload.Description,
                Title = payload.Title,
                UserId = userId,
                CategoryId = payload.CategoryId,

            });
            await _context.SaveChangesAsync();

            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Category)
                .FirstAsync(p => p.Id == post.Entity.Id);

        }

        public async Task<Post> DeletePost(Guid id)
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.comments)
                .Include(p => p.Likes)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) return null;

            _context.Comments.RemoveRange(post.comments);
            _context.PostLikes.RemoveRange(post.Likes);
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<Post> GetPostById(Guid id)
        {
            var post = await _context.Posts.Include(p => p.User).Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            return post;

        }

        public async Task<IQueryable<Post>> GetPosts(int startFrom, int count)
        {
            var posts = _context.Posts.Include(p => p.User).Include(p => p.Category).Skip(startFrom).Take(count).AsNoTracking();
            return posts;
        }

        public async Task<Post> UpdatePost(Guid postId, PostAddRequest payload)
        {

            var post = await _context.Posts.Include(p => p.User).Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null) return null;
            post.UpdatePost(payload);
            await _context.SaveChangesAsync();
            return post;
        }
    }
}
