using FanPulseApi.DTO;
using FanPulseApi.Exceptions;
using FanPulseApi.Models;
using FanPulseApi.Validators;
using System.Runtime.InteropServices;

namespace FanPulseApi.Services.Comment
{
    public class CommentService : ICommentService
    {

        private readonly ICommentRepository _commentRepository;
        private readonly ISpecification<string> _specification;


        public CommentService(ICommentRepository commentRepository,ISpecification<string> spec)
        {
            _commentRepository = commentRepository;
            _specification = spec;

        }

        public async Task<CommentReponse> AddComment(CommentAddRequest payload, Guid userId)
        {
            if (!_specification.IsSatisfiedBy(payload.CommentText)) throw new BusinessRuleException("Comment has a frobidden words");

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

        public async Task<CommentReponse> UpdateComment(Guid id, CommentAddRequest payload)
        {
            var updatedComment = await _commentRepository.UpdateComment(id, payload);
            return CommentMapper.ToDto(updatedComment);

            
        }
    }
}
