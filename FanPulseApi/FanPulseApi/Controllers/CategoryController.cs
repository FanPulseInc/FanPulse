using FanPulseApi.DTO.Category;
using FanPulseApi.Services.Category;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FanPulseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET: api/<Category>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAll()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        // GET: api/Category/roots
        [HttpGet("roots")]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetRoots()
        {
            var roots = await _categoryService.GetRootCategoriesAsync();
            return Ok(roots);
        }
        
        // GET: api/Category/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CategoryResponse>> GetById(Guid id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            
            return Ok(category);
        }
        
        // GET: api/Category/{id}/subcategories
        [HttpGet("{id:guid}/subcategories")]
        public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetSubCategories(Guid id)
        {
            var subCategories = await _categoryService.GetSubCategoriesAsync(id);
            return Ok(subCategories);
        }

        // POST: api/Category
        [HttpPost]
        public async Task<ActionResult<CategoryResponse>> Create([FromBody] CategoryAddRequest request)
        {
            var result = await _categoryService.CreateCategoryAsync(request);
            if (result == null)
            {
                return BadRequest("Could not create category.");
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // PUT: api/Category/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<CategoryResponse>> Update(Guid id, [FromBody] CategoryUpdateRequest request)
        {
            var result = await _categoryService.UpdateCategoryAsync(id, request);
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        // DELETE: api/Category/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _categoryService.DeleteCategoryAsync(id);
            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
