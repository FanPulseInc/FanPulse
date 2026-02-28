using System.Runtime.InteropServices;

namespace FanPulseApi.Models
{
    public interface ICommentRepository
    {
         public Task<Comment> NewComment(Comment comment);

         public Task<Comment> UpdateComment(Guid commentId,Comment comment);

         public Task<bool> DeleteComment(Comment comment);



      
    }
}
