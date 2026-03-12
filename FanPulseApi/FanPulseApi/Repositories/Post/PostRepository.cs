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
                UserId = userId
                
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
            var post = await _context.Posts.FindAsync(id);
            return post ?? null;

        }

        public async Task<IEnumerable<Post>> GetPosts(int startFrom, int count)
        {
            var posts = await _context.Posts.Skip(startFrom).Take(count).AsNoTracking().ToListAsync();
            return posts;
        }

        public async Task<Post> UpdatePost(Guid postId, PostAddRequest payload)
        {

            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return null;
            post.UpdatePost(payload);
            await _context.SaveChangesAsync();
            return post;
        }
    }
}
