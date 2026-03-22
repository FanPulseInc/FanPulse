using FanPulseApi.DTO.Report;

namespace FanPulseApi.Services.Report
{
    public interface IReportService
    {
        public Task<ReportResponse> AddReportAsync(DTO.Report.ReportAddRequest payload, Guid reporterId);

        public Task<ReportResponse> UpdateReportAsync(Guid reportId, ReportAddRequest report);

        public Task<ReportResponse> RemoveReportAsync(Guid reportId);

        public Task<IEnumerable<ReportResponse>> GetReportsForUserByIdAsync(Guid userId);
        public Task<int> GetCountReportsForUserByIdAsync(Guid userId);

        public Task<ReportResponse> CloseReportAsync(Guid reportId);

        public Task<ReportResponse> GetReportByIdAsync(Guid guid);
    }
}
