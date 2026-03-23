using FanPulseApi.Models;

namespace FanPulseApi.DTO.Report
{
    public class ReportAddRequest
    {
        public Guid ReportedId;
        public string? description;
        public ReportReasons reason;
        
    }
}
