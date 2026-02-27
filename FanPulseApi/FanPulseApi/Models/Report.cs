namespace FanPulseApi.Models
{
    public enum ReportStatus { 
        Pending = 1,
        Closed = 2,
    }
    public enum ReportReasons
    {
        Abuse = 1,
        Extortion = 2,
        Fraud = 3,

    }

    public class Report
    {
        public Guid Guid { get; set; }

       
        public Guid ReportedUserId { get; set; }
        public User ReportedUser { get; set; } = null!;


        public Guid ReporterId { get; set; }
        public User Reporter { get; set; } = null!;



        public string? description { get; set; }

        public ReportStatus Status { get; set; }

        public ReportReasons Reason {  get; set; }


        public DateTimeOffset CreatedAt { get; set; } = TimeProvider.System.GetUtcNow();
        public DateTimeOffset UpdatedAt { get; set; } = TimeProvider.System.GetUtcNow();


        public bool CloseReport()
        {
            Status = ReportStatus.Closed;
            return true;
        }

       
    }
}
