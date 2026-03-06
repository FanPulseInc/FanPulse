using FanPulseApi.DTO;
using System.Runtime.InteropServices;

namespace FanPulseApi.Models
{
    public interface ICommentRepository
    {
         public Task<Comment> NewComment(Comment comment);

         public Task<Comment> UpdateComment(Guid commentId,CommentAddRequest comment);

         public Task<Comment> DeleteComment(Comment comment);

        public Task<List<Comment>> GetCommentsByPost(Guid postId);

        public Task<List<Comment>> GetChilderns(Guid commentId);

        public Task<Comment> AddComment(CommentAddRequest comment);

        
    
    }
}
