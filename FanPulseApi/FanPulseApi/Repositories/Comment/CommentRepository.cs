using FanPulseApi.Data;
using FanPulseApi.DTO;
using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore;
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
            var comment =  await _context.Comments.AddAsync(new Models.Comment()
            {
                CommentText = payload.CommentText,
                ParentId = payload.ParrentId ?? null,
                PostId = payload.PostId,
                UserId = userId
            });
            return comment.Entity;      
        }

        public async Task<Models.Comment> DeleteComment(Guid id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null) return null;
            var deletedComment = _context.Comments.Remove(comment);
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

     

        public Task<Models.Comment> UpdateComment(Guid commentId, CommentAddRequest comment)
        {
            throw new NotImplementedException();
        }
    }
}
