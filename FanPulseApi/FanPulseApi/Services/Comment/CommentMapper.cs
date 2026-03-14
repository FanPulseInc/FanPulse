using FanPulseApi.DTO;
using FanPulseApi.DTO.Comment;
using FanPulseApi.Models;
using FanPulseApi.Services.Post;

namespace FanPulseApi.Services.Comment
{
    public static class CommentMapper
    {
        public static  CommentReponse ToDto( Models.Comment comment)
        {
            return new CommentReponse()
            {
                CommentText = comment.CommentText,
                User = comment.User ?? null,
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
