using FanPulseApi.DTO;
using FanPulseApi.Services;
using Microsoft.AspNetCore.Mvc;
using Npgsql.PostgresTypes;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FanPulseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {

        private readonly IPostService _service;

        public PostController(IPostService service)
        {
            _service = service;
        }

        // GET: api/<PostController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PostResponce>>> Get(int page,int count)
        {
           var posts = await _service.GetPosts(page);
           if (posts.Count() == 0) return NoContent();
           return Ok(posts);

        }

        // GET api/<PostController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PostResponce>> Get(Guid id)
        {
            var post = await _service.GetPost(id);
            if (post == null) return NotFound();
            return post;
        }

        // POST api/<PostController>
        [HttpPost]
        public async Task<ActionResult<PostResponce>> Post([FromBody] PostAddRequest payload)
        {
            var post = await _service.AddPost(payload,new Guid());
            return Ok(post) ?? null;
            
        }

        // PUT api/<PostController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<PostResponce>> Put(Guid id,[FromBody]PostAddRequest payload)
        {
            var post = await _service.UpdatePost(id,payload);
            if (post == null) return BadRequest();
            return post;

        }

        // DELETE api/<PostController>/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<PostResponce>> Delete(Guid id)
        {
            var deletedPost = _service.DeletePost(id);
            if (deletedPost == null) return NotFound();
            return Ok(deletedPost);

        }
    }
}
