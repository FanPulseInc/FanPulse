using FanPulseApi.DTO;
using FanPulseApi.Models;
using System.Runtime.InteropServices;

namespace FanPulseApi.Services.Comment
{
    public class CommentService : ICommentService
    {

        private readonly ICommentRepository _commentRepository;

        public CommentService(ICommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        public async Task<CommentReponse> AddComment(CommentAddRequest payload, Guid userId)
        {
            var comment = await _commentRepository.AddComment(payload,userId);

            return CommentMapper.ToDto(comment);

        }

        public async Task<CommentReponse> DeleteComment(Guid id)
        {
            var comment = await _commentRepository.DeleteComment(id);
           
            return CommentMapper.ToDto(comment);

            
           
        }

        public async Task<List<CommentReponse>> GetChildrens(Guid commentId)
        {
            var childrens = await _commentRepository.GetChilderns(commentId);
            return CommentMapper.ToDtoArray(childrens);
        }

        public async Task<CommentReponse> GetCommentById(Guid id)
        {
            var comment = await _commentRepository.GetCommentById(id);
            return CommentMapper.ToDto(comment);
            
        }

        public async Task<List<CommentReponse>> GetCommentsByPost(Guid postId)
        {
            var comments = await _commentRepository.GetCommentsByPost(postId);
            return CommentMapper.ToDtoArray(comments);

        }

        public async Task<List<CommentReponse>> GetCommentsByUserId(Guid userId)
        {
            var comment = await  _commentRepository.GetCommentsByUserId(userId);
            return CommentMapper.ToDtoArray(comment);
            
        }
        
    }
}
