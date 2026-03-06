using FanPulseApi.DTO;
using FanPulseApi.Models;
namespace FanPulseApi.Services.Comment
{
    public static class CommentMapper
    {
        public static  CommentReponse ToDto( Models.Comment comment)
        {
            return new CommentReponse()
            {
                CommentText = comment.CommentText,
                User = comment.User,
                Post = PostMapper.ToDto(comment.Post),
                Children = ToDtoArray(comment.Children.ToList()),
                

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
