using FanPulseApi.Data;
using FanPulseApi.DTO;
using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Internal;

namespace FanPulseApi.Repositories.Comment
{
    public class CommentRepository : ICommentRepository
    {
        private readonly FanPusleDbContext _context;

        public CommentRepository(FanPusleDbContext context)
        {
            _context = context;
        }

        public async Task<Models.Comment> AddComment(CommentAddRequest payload, Guid userId)
        {

            

            var newComment = new Models.Comment()
            {
                Id = Guid.NewGuid(),
                CommentText = payload.CommentText,
                ParentId = payload.ParrentId ?? null,
                PostId = payload.PostId,
                UserId = userId
            };
            await _context.Comments.AddAsync(newComment);
            await _context.SaveChangesAsync();

            return await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Children)
                .FirstAsync(c => c.Id == newComment.Id);
        }

        public async Task<Models.Comment> DeleteComment(Guid id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return null;
            var deletedComment = _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return deletedComment.Entity;

        }

        public  ICollection<Models.Comment> GetChilderns(Guid commentId)
        {
            var comment = _context.Comments
                .Include(c => c.Children)
                .FirstOrDefault(i => i.Id == commentId);
                
            return comment.Children ?? null;
        }

        public async Task<Models.Comment> GetCommentById(Guid id)
        {
            return await _context.Comments.Include(c => c.User).Include(c => c.Children).FirstOrDefaultAsync(c => c.Id == id);

             
        }

        public IQueryable<Models.Comment> GetCommentsByPost(Guid postId)
        {
           var comment = _context.Comments.Include(c => c.User).Include(c => c.Children).Where(c => c.PostId == postId);
           return comment;

        }

        public IQueryable<Models.Comment> GetCommentsByUserId(Guid userId)
        {
            return _context.Comments.Include(c => c.User).Include(c => c.Children).Where(i => i.UserId == userId);
        }

     

        public async Task<Models.Comment> UpdateComment(Guid commentId, CommentAddRequest payload)
        {
            var comment = await _context.Comments.Include(c => c.User).Include(c => c.Children).FirstOrDefaultAsync(c => c.Id == commentId);
            if (comment == null) return null;

            comment.UpdateComment(payload.CommentText);
            await _context.SaveChangesAsync();
            return comment;


            

        }

    }
}
