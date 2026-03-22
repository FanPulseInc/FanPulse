using FanPulseApi.DTO.Report;
using FanPulseApi.Repositories.Report;
using FanPulseApi.Services.Report;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FanPulseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private IReportService _service;

        public ReportController(IReportService service)
        {
            _service = service;
        }
    
        // GET api/<ReportController>/5
        [HttpGet("{id}")]
        public async Task<ReportResponse> Get(Guid id)
        {
            var report = await _service.GetReportById(id);
            if (report == null) return null;
            return report;

        }

        // POST api/<ReportController>
        [HttpPost]
        public async Task<ReportResponse> Post([FromBody] ReportAddRequest payload)
        {
            var report = await _service.AddReport(payload, new Guid());
            return report;

        }

        // PUT api/<ReportController>/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ReportResponse>> Put(Guid id, [FromBody] ReportAddRequest payload)
        {
            var report = await _service.UpdateReport(id, payload);
            if (report == null) return BadRequest("Error when update report");
            return Ok(report);
        }

        // DELETE api/<ReportController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {

        }

        [HttpGet("user-reports")]
        public async Task<ActionResult<IEnumerable<ReportResponse>>> GetReportsForUser([FromQuery]Guid id)
        {
            var reports = await _service.GetReportsForUserById(id);
            if (reports == null) return NotFound();
            return Ok(reports);
        }



        [HttpPatch("{id}/close")]
        public async Task<ActionResult<ReportResponse>>CloseReport(Guid id)
        {
            var report = await _service.GetReportById(id);
            if (report == null) return BadRequest("Error when closing report");
            return report;

        }




    }
}
