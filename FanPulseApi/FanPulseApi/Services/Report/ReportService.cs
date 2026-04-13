using FanPulseApi.DTO.Report;
using FanPulseApi.Exceptions;
using FanPulseApi.Models;
using FanPulseApi.Repositories.Report;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Services.Report
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _repository;

        public ReportService(IReportRepository repository)
        {
            _repository = repository;
        }

        public async Task<ReportResponse> AddReportAsync(ReportAddRequest payload, Guid reporterId)
        {
            if (!await HasNoDuplicateAsync(payload, reporterId))
            {
                throw new BusinessRuleException("You already reported that person. Please wait for the consideration");
            }

            var report = await _repository.AddReportAsync(payload, reporterId);
            return ReportMapper.ToDto(report);
        }

        private async Task<bool> HasNoDuplicateAsync(ReportAddRequest request, Guid reporterId)
        {
            var reportsQuery = await _repository.GetUserReportsByIdAsync(reporterId);
            var exists = await reportsQuery.AnyAsync(i => i.ReportedUserId == request.ReportedId);
            return !exists;
        }

        public async Task<ReportResponse> CloseReportAsync(Guid reportId)
        {
            var updatedReport = await _repository.CloseReportAsync(reportId);
            return ReportMapper.ToDto(updatedReport);
        }

        public async Task<int> GetCountReportsForUserByIdAsync(Guid userId)
        {
            return await _repository.GetCountReportsForUserByIdAsync(userId);
        }

        public async Task<ReportResponse> GetReportByIdAsync(Guid guid)
        {
            var report = await _repository.GetReportByIdAsync(guid);
            if (report == null) return null;
            return ReportMapper.ToDto(report);
        }

        public async Task<IEnumerable<ReportResponse>> GetReportsForUserByIdAsync(Guid userId)
        {
            var reportsQuery = _repository.GetReportsForUserById(userId);
            var list = await reportsQuery.ToListAsync();
            return ReportMapper.ToArrayDto(list);
        }

        public async Task<ReportResponse> RemoveReportAsync(Guid reportId)
        {
            var removedReport = await _repository.RemoveReportAsync(reportId);
            return ReportMapper.ToDto(removedReport);
        }

        public async Task<ReportResponse> UpdateReportAsync(Guid reportId, ReportAddRequest report)
        {
            var updatedReport = await _repository.UpdateReportAsync(reportId, report);
            return ReportMapper.ToDto(updatedReport);
        }
    }
}
