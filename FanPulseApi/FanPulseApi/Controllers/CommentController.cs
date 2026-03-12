using FanPulseApi.DTO;
using FanPulseApi.Services.Comment;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using FanPulseApi.DTO.Comment;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FanPulseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }


        // GET: api/<CommentController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<CommentController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CommentReponse>> Get(Guid id)
        {
            var comment = await _commentService.GetCommentById(id);
            if (comment == null) return NotFound();
            return Ok(comment);

           
        }

        // POST api/<CommentController>
        [HttpPost]
        public async Task<ActionResult<CommentReponse>> Post([FromBody] CommentAddRequest payload)
        {
            var comment = await _commentService.AddComment(payload,new Guid());
            return Ok(comment);
        }

        // PUT api/<CommentController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<CommentReponse>> Put([FromBody] CommentAddRequest payload,Guid id)
        {
            var updatedComment = await _commentService.UpdateComment(id, payload);
            return Ok(updatedComment);
        }

        // DELETE api/<CommentController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<CommentReponse>> Delete(Guid id)
        {
           var deletedComment  = await _commentService.DeleteComment(id);
           if (deletedComment == null) return null ;
           return Ok(deletedComment);
        }
    }
}
