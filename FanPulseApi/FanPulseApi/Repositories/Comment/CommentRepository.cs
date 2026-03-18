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

            

            var comment = await _context.Comments.AddAsync(new Models.Comment()
            {
                CommentText = payload.CommentText,
                ParentId = payload.ParrentId ?? null,
                PostId = payload.PostId,
                UserId = new Guid("8116e90f-422d-4c4c-9c8e-e759ad1ae497") // Should remove this mock.
            });
            await _context.SaveChangesAsync();
            return comment.Entity;      
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
            return await _context.Comments.FindAsync(id) ?? null;

             
        }

        public IQueryable<Models.Comment> GetCommentsByPost(Guid postId)
        {
           var comment = _context.Comments.Where(c => c.PostId == postId);
           return comment;

        }

        public IQueryable<Models.Comment> GetCommentsByUserId(Guid userId)
        {
            return _context.Comments.Where(i => i.UserId == userId);
        }

     

        public async Task<Models.Comment> UpdateComment(Guid commentId, CommentAddRequest payload)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            if (comment == null) return null;

            comment.UpdateComment(payload.CommentText);
            await _context.SaveChangesAsync();
            return comment;


            

        }

    }
}
