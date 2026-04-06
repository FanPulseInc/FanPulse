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
                UserId = new Guid(),
                CategoryId = payload.CategoryId,
                
            });
            await _context.SaveChangesAsync();
            return post.Entity;

        }

        public async Task<Post> DeletePost(Guid id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return null;

            var deletedPost = _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return deletedPost.Entity;
           
        }

        public async Task<Post> GetPostById(Guid id)
        {
            var post = await _context.Posts.Include(c=>c.User).FirstOrDefaultAsync(p=>p.Id == id);
            return post ?? null;

        }

        public async Task<IQueryable<Post>> GetPosts(int startFrom, int count)
        {
            var posts = _context.Posts.Skip(startFrom).Take(count).AsNoTracking();
            return posts;
        }

        public async Task<Post> UpdatePost(Guid postId, PostAddRequest payload)
        {

            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post == null) return null;
            post.UpdatePost(payload);
            await _context.SaveChangesAsync();
            return post;
        }
    }
}
