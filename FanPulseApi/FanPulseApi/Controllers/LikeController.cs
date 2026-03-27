using FanPulseApi.DTO.Like;
using FanPulseApi.Services.Like;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FanPulseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikeController : ControllerBase
    {
        private readonly ILikeService _likeService;

        public LikeController(ILikeService likeService)
        {
            _likeService = likeService;
        }




        // GET: api/<LikeController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

  
        // POST api/<LikeController>
        [HttpPost("{postId}")]
        public void Post([FromRoute]Guid postId)
        {

            _likeService.AddLike()
            
        }

        // PUT api/<LikeController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<LikeController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
