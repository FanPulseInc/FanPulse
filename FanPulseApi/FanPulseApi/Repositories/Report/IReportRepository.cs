using FanPulseApi.Models;
using System.Runtime.CompilerServices;

namespace FanPulseApi.Models
{
    public interface IReportRepository
    {
        public Task<Report> AddReport(Report report);

        public Task<Report> UpdateReport(Guid reportId,Report report);

        public Task<Report> RemoveReport(Guid reportId);

        public Task<List<Report>> GetReportsForUserById(Guid userId);

        public Task<int> GetCountReportsForUserById(Guid userId);

        public Task<Report>CloseReport(Guid reportId);

        public Task<Report> GetReportById(Guid guid);

       

    }
}
