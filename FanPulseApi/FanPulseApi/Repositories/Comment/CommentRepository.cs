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
                UserId = new Guid("8116e90f-422d-4c4c-9c8e-e759ad1ae497")
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

        public async Task<List<Models.Comment>> GetChilderns(Guid commentId)
        {
            var comment = await _context.Comments.FindAsync(commentId);
            return null; // should resolve later
        }

        public async Task<Models.Comment> GetCommentById(Guid id)
        {
            return await _context.Comments.FindAsync(id) ?? null;

             
        }

        public async Task<List<Models.Comment>> GetCommentsByPost(Guid postId)
        {
           var comment = await _context.Comments.Where(c => c.PostId == postId).ToListAsync();
           return comment;

        }

        public Task<List<Models.Comment>> GetCommentsByUserId(Guid userId)
        {
            return null;

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
