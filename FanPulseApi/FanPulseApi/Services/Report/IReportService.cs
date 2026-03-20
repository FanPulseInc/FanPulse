using FanPulseApi.DTO.Report;

namespace FanPulseApi.Services.Report
{
    public interface IReportService
    {
        public Task<ReportResponse> AddReport(DTO.Report.ReportAddRequest payload,Guid reporterId);

        public Task<ReportResponse> UpdateReport(Guid reportId, ReportAddRequest report);

        public Task<ReportResponse> RemoveReport(Guid reportId);

        public Task<IEnumerable<ReportResponse>> GetReportsForUserById(Guid userId);

        public int GetCountReportsForUserById(Guid userId);

        public Task<ReportResponse> CloseReport(Guid reportId);

        public Task<ReportResponse> GetReportById(Guid guid);

    }
}
