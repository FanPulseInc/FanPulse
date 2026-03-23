using FanPulseApi.Data;
using FanPulseApi.DTO.Report;
using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Repositories.Report
{
    public class ReportRepository : IReportRepository
    {
        private readonly FanPusleDbContext _context;

        public ReportRepository(FanPusleDbContext context)
        {
            _context = context;
        }

        public async Task<Models.Report> AddReportAsync(ReportAddRequest payload)
        {
            var report = new Models.Report()
            {
                description = payload.description,
                ReportedUserId = payload.ReportedId,
                Reason = payload.reason,
                ReporterId = payload.ReportedId,
            };

            await _context.Reports.AddAsync(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<Models.Report> CloseReportAsync(Guid reportId)
        {
            var report = await _context.Reports.FindAsync(reportId);
            if (report == null) return null;

            report.Status = ReportStatus.Closed;
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<int> GetCountReportsForUserByIdAsync(Guid userId)
        {
            var count = await _context.Reports.CountAsync(i => i.ReportedUserId == userId);
            return count;
        }

        public async Task<Models.Report> GetReportByIdAsync(Guid guid)
        {
            return await _context.Reports.FindAsync(guid);
        }

        public IQueryable<Models.Report> GetReportsForUserById(Guid userId)
        {
   
            return _context.Reports.Where(i => i.ReportedUserId == userId);
        }

        public async Task<IQueryable<Models.Report>> GetUserReportsByIdAsync(Guid userId)
        {
          
            return _context.Reports.Where(i => i.ReporterId == userId);
        }

        public async Task<Models.Report> RemoveReportAsync(Guid reportId)
        {
            var report = await _context.Reports.FindAsync(reportId);
            if (report == null) return null;

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<Models.Report> UpdateReportAsync(Guid reportId, ReportAddRequest payload)
        {
            var report = await _context.Reports.FindAsync(reportId);
            if (report == null) return null;

            report.description = payload.description;

            await _context.SaveChangesAsync();
            return report;
        }
    }
}
