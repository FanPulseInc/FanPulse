using FanPulseApi.Models;

namespace FanPulseApi.DTO.Report
{
    public class ReportAddRequest
    {
        public Guid ReportedId { get; set; }
        public string? Description { get; set; }
        public ReportReasons Reason { get; set; }
        
    }
}
