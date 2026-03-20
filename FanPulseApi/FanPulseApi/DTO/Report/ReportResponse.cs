using FanPulseApi.DTO.User;
using FanPulseApi.Models;

namespace FanPulseApi.DTO.Report
{
    public class ReportResponse
    {
        public Guid Id { get; set; }


   
        public UserResponse ReportedUser { get; set; } = null!;
        public UserResponse Reporter { get; set; } = null!;

        public string? description { get; set; }

        public ReportStatus Status { get; set; }

        public ReportReasons Reason { get; set; }
       public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();

    }
}
