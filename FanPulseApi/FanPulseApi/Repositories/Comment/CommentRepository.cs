using FanPulseApi.Data;
using FanPulseApi.DTO;
using FanPulseApi.Models;
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

        public Task<Models.Comment> AddComment(CommentAddRequest comment, Guid userId)
        {
            _context.Comments.AddAsync(new Models.Comment() { 
                CommentText = comment.CommentText,
                ParentId = comment.ParrentId??null,
                PostId = comment.PostId,
                UserId = comment
                })
           
        }

        public Task<Models.Comment> DeleteComment(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<Models.Comment>> GetChilderns(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task<Models.Comment> GetCommentById(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<Models.Comment>> GetCommentsByPost(Guid postId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Models.Comment>> GetCommentsByUserId(Guid userId)
        {
            throw new NotImplementedException();
        }

     

        public Task<Models.Comment> UpdateComment(Guid commentId, CommentAddRequest comment)
        {
            throw new NotImplementedException();
        }
    }
}
