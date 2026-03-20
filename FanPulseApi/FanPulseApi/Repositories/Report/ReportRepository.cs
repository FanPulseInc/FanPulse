using FanPulseApi.Data;
using FanPulseApi.DTO.Report;
using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Repositories.Report
{
    public class ReportRepository : IReportRepository
    {
        private readonly FanPusleDbContext _context;

        public async Task<Models.Report> AddReport(ReportAddRequest payload)
        {
           var report = await  _context.Reports.AddAsync(new Models.Report()
            {
                description = payload.description,
                ReportedUserId = payload.ReportedId,
                Reason = payload.reason,
                ReporterId = payload.ReportedId,


            });
            return report.Entity;
        }

        public async Task<Models.Report> CloseReport(Guid reportId)
        {
            var report =  await _context.Reports.FindAsync(reportId);
            if (report == null) return null;

            report.Status = ReportStatus.Closed;
            await _context.SaveChangesAsync();
            return report;
        }

        public int GetCountReportsForUserById(Guid userId)
        {
            return _context.Reports.Count(i => i.ReportedUserId == userId);
         
        }

        public async Task<Models.Report> GetReportById(Guid guid)
        {
            var report = await _context.Reports.FindAsync(guid);
            if (report == null) return null;

            
            
            return report;
        }

        public IQueryable<Models.Report> GetReportsForUserById(Guid userId)
        {
            var reports = _context.Reports.Where(i => i.ReportedUserId == userId);
            return reports;
            
        }

        public async Task<IQueryable<Models.Report>> GetUserReportsById(Guid userId)
        {
            var reports = _context.Reports.Where(i => i.ReporterId == userId);
            return reports;
        }

        public async Task<Models.Report> RemoveReport(Guid reportId)
        {
            var report = await _context.Reports.FindAsync(reportId);

            if(report == null) return null;

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<Models.Report> UpdateReport(Guid reportId, ReportAddRequest payload)
        {
            var report = await _context.Reports.FindAsync(reportId);
            if (report == null) return null;

            report.description = payload.description;

            await _context.SaveChangesAsync();
            return report;

        }

        public async Task<int> GetCountReportsForUserById(Guid userId)
        {
            var count = await  _context.Reports.CountAsync(i => i.ReportedUserId == userId);
            return count;
        }
        


    }
}
