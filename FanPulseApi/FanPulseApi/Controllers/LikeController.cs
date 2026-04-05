using FanPulseApi.Models;
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

        // GET: api/Like/count/{targetId}
        [HttpGet("count/{targetId}")]
        public async Task<ActionResult<int>> GetLikeCount(Guid targetId)
        {
            var count = await _likeService.GetLikeCountAsync(targetId);
            return Ok(count);
        }
        

        // GET: api/Like/check?targetId=...&userId=...
        [HttpGet("check")]
        public async Task<ActionResult<bool>> CheckIfLiked([FromQuery] Guid targetId, [FromQuery] Guid userId)
        {
            var isLiked = await _likeService.IsLikedByUserAsync(targetId, userId);
            return Ok(isLiked);
        }

  
        // POST: api/Like
        [HttpPost]
        public async Task<ActionResult<PostLike>> Post([FromBody] PostLike postLike)
        {
            try
            {
                var result = await _likeService.AddLikeAsync(postLike);
                return CreatedAtAction(nameof(GetLikeCount), new { targetId = result.PostId ?? result.CommentId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: api/Like/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _likeService.DeleteLikeAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent(); 
        }

    }
}
