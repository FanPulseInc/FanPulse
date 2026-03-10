using FanPulseApi.DTO;
using System.Net;

namespace FanPulseApi.Services.Comment
{
    public interface ICommentService
    {
        public Task<CommentReponse> GetCommentById(Guid id);
        public Task<List<CommentReponse>> GetCommentsByPost(Guid postId);

        public Task<List<CommentReponse>> GetCommentsByUserId (Guid userId);

        public Task<CommentReponse>AddComment(CommentAddRequest payload,Guid userId);

        public Task<CommentReponse>DeleteComment(Guid id);

        public Task<List<CommentReponse>>GetChildrens(Guid commentId);

        public Task<CommentReponse> UpdateComment(Guid id, CommentAddRequest payload);


        
    }
}
