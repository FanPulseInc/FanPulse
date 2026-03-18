using FanPulseApi.DTO;
using FanPulseApi.Exceptions;
using FanPulseApi.Models;
using System.Runtime.InteropServices;
using FanPulseApi.DTO.Comment;
using Microsoft.EntityFrameworkCore;
using FanPulseApi.Validators.Specification;

namespace FanPulseApi.Services.Comment
{
    public class CommentService : ICommentService
    {

        private readonly ICommentRepository _commentRepository;
        private readonly ISpecification<string> _wordSpec;
        private readonly ISpecification<OwnerCheckRequest> _ownerCheckRequest;


        public CommentService(ICommentRepository commentRepository,ISpecification<string> spec, ISpecification<OwnerCheckRequest> ownerCheckRequest)
        {
            _commentRepository = commentRepository;
            _wordSpec = spec;
            _ownerCheckRequest = ownerCheckRequest;
        }

        public async Task<CommentReponse> AddComment(CommentAddRequest payload, Guid userId)
        {
            if (!_wordSpec.IsSatisfiedBy(payload.CommentText)) throw new BusinessRuleException("Comment has a frobidden words");

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
            var childrens = _commentRepository.GetChilderns(commentId);
            return CommentMapper.ToDtoArray(childrens.ToList());
        }

        public async Task<CommentReponse> GetCommentById(Guid id)
        {
            var comment = await _commentRepository.GetCommentById(id);
            return CommentMapper.ToDto(comment);
            
        }

        public async Task<List<CommentReponse>> GetCommentsByPost(Guid postId)
        {
            var comments =  _commentRepository.GetCommentsByPost(postId);
            return CommentMapper.ToDtoArray(await comments.ToListAsync());

        }

        public async Task<List<CommentReponse>> GetCommentsByUserId(Guid userId)
        {
            var comment = _commentRepository.GetCommentsByUserId(userId);
            return CommentMapper.ToDtoArray(await comment.ToListAsync());
            
        }

        public async Task<CommentReponse> UpdateComment(Guid id, CommentAddRequest payload)
        {
            var updatedComment = await _commentRepository.UpdateComment(id, payload);
            return CommentMapper.ToDto(updatedComment);

            
        }
    }
}
