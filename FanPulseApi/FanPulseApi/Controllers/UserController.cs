using FanPulseApi.DTO;
using FanPulseApi.DTO.User;
using FanPulseApi.Services.User;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FanPulseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        
        // GET: api/<UserController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserResponse>> GetById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            
            return Ok(user);
        }

        // POST api/<UserController>
        [HttpPost]
        public async Task<ActionResult<UserResponse>> Create([FromBody] UserAddRequest request)
        {
            var newUser = await _userService.AddUserAsync(request);
            if (newUser == null)
            {
                return BadRequest("Could not create user.");
            }

            return CreatedAtAction(nameof(GetById), new { id = newUser.Id }, newUser);
        }

        // PUT api/<UserController>/5
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<UserResponse>> Update(Guid id, [FromBody] UserUpdateRequest request)
        {
            var updatedUser = await _userService.UpdateUserAsync(id, request);
            if (updatedUser == null)
            {
                return NotFound();
            }

            return Ok(updatedUser);
        }
        
        [HttpPatch("{id:guid}/change-password")]
        public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordRequest request)
        {
            var success = await _userService.ChangePasswordAsync(id, request);
            if (!success)
            {
                return BadRequest("Password change failed.");
            }

            return NoContent();
        }

        // DELETE api/<UserController>/5
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult<UserResponse>> Delete(Guid id)
        {
            var deletedUser = await _userService.DeleteUserAsync(id);
            if (deletedUser == null)
            {
                return NotFound();
            }

            return Ok(deletedUser);
        }
    }
}
