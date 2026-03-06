using FanPulseApi.DTO;
using FanPulseApi.Models;

namespace FanPulseApi.Services.Comment
{
    public class CommentService : ICommentService
    {

        private readonly ICommentRepository _commentRepository;

        public CommentService(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        public Task<CommentReponse> AddComment(CommentAddRequest payload)
        {
            var comment = _commentRepository.AddComment(payload);

            return c
        }

        public Task<CommentReponse> DeleteComment(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<CommentReponse>> GetChildrens(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task<CommentReponse> GetCommentById(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<List<CommentReponse>> GetCommentsByPost(Guid postId)
        {
            throw new NotImplementedException();
        }

        public Task<List<CommentReponse>> GetCommentsByUserId(Guid userId)
        {
            throw new NotImplementedException();
        }
    }
}
