using FanPulseApi.DTO.Report;
using FanPulseApi.Models;
using System.Runtime.CompilerServices;

namespace FanPulseApi.Models
{
    public interface IReportRepository
    {
        public Task<Report> AddReport(DTO.Report.ReportAddRequest payload);

        public Task<Report> UpdateReport(Guid reportId,ReportAddRequest report);

        public Task<Report> RemoveReport(Guid reportId);

        public IQueryable<Report> GetReportsForUserById(Guid userId);

        public Task<int> GetCountReportsForUserById(Guid userId);

        public Task<IQueryable<Report>> GetUserReportsById(Guid userId);

        public Task<Report>CloseReport(Guid reportId);

        public Task<Report> GetReportById(Guid guid);

       

    }
}
