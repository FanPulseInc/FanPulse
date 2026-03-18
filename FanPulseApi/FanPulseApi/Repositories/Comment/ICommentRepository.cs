using FanPulseApi.DTO;
using System.Runtime.InteropServices;

namespace FanPulseApi.Models
{
    public interface ICommentRepository
    {
        

        public Task<Comment> UpdateComment(Guid commentId,CommentAddRequest comment);

        public Task<Comment> DeleteComment(Guid id);

        public Task<IQueryable<Comment>> GetCommentsByPost(Guid postId);

        public Task<ICollection<Comment>> GetChilderns(Guid commentId);

        public Task<Comment> AddComment(CommentAddRequest comment,Guid userId);

        public IQueryable<Comment> GetCommentsByUserId(Guid userId);

        public Task<Comment> GetCommentById(Guid id);

        
        
    }
}
