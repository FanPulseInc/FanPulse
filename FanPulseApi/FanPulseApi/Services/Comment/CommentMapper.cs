using FanPulseApi.DTO;
using FanPulseApi.DTO.Comment;
using FanPulseApi.Models;
using FanPulseApi.Services.Post;
using FanPulseApi.Services.User;

namespace FanPulseApi.Services.Comment
{
    public static class CommentMapper
    {
        public static  CommentReponse ToDto( Models.Comment comment)
        {
            return new CommentReponse()
            {
                Id = comment.Id,
                CommentText = comment.CommentText,
                User = UserMapper.ToDto(comment.User),
                Post = comment.Post != null ? PostMapper.ToDto(comment.Post) : null,
                Children = ToDtoArray(comment.Children.ToList()) ?? null,
            };

        }

        public static List<CommentReponse> ToDtoArray(List<Models.Comment> comments)
        {
            var list = new List<CommentReponse>();

            foreach (var comment in comments)
            {
                list.Add(ToDto(comment));
            }
            return list;
        }

    }
}
