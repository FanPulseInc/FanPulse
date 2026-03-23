using FanPulseApi.DTO.Report;
using FanPulseApi.Models;
using System.Runtime.CompilerServices;

namespace FanPulseApi.Models
{
    public interface IReportRepository
    {
        public Task<Report> AddReportAsync(DTO.Report.ReportAddRequest payload);

        public Task<Report> UpdateReportAsync(Guid reportId, ReportAddRequest report);

        public Task<Report> RemoveReportAsync(Guid reportId);

       
        public IQueryable<Report> GetReportsForUserById(Guid userId);

        public Task<int> GetCountReportsForUserByIdAsync(Guid userId);
        public Task<IQueryable<Report>> GetUserReportsByIdAsync(Guid userId);

        public Task<Report> CloseReportAsync(Guid reportId);

        public Task<Report> GetReportByIdAsync(Guid guid);



    }
}
