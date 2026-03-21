using FanPulseApi.DTO.Report;
using FanPulseApi.Exceptions;
using FanPulseApi.Models;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;

namespace FanPulseApi.Services.Report
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _repository;

        public ReportService(IReportRepository repository)
        {
            _repository = repository;
        }

        public async Task<ReportResponse> AddReport(ReportAddRequest payload,Guid reporterId)
        {
            if(!await HasNoDublicate(payload,reporterId))
            {
                throw new BusinessRuleException("You already reported that person. Please wait for the consideration");
            }
            
           var report =  await _repository.AddReport(payload);
            return ReportMapper.ToDto(report);    
        }

        private async Task<bool> HasNoDublicate(ReportAddRequest request,Guid reporterId) 
        {
            var reports = await _repository.GetUserReportsById(reporterId);
            if ((await reports.ToListAsync()).Find(i => i.ReportedUserId == request.ReportedId) != null) return false;
            return true;
        }

        public async Task<ReportResponse> CloseReport(Guid reportId)
        {
            var updatedReport = await _repository.CloseReport(reportId);

            return ReportMapper.ToDto(updatedReport);

        }

        public int GetCountReportsForUserById(Guid userId)
        {
            throw new NotImplementedException();
        }

        public async Task<ReportResponse> GetReportById(Guid guid)
        {
            var report = await _repository.GetReportById(guid);
            if (report == null) return null;
            return ReportMapper.ToDto(report);
        }

        public async Task<IEnumerable<ReportResponse>> GetReportsForUserById(Guid userId)
        {
            var reports = _repository.GetReportsForUserById(userId);
            return ReportMapper.ToArrayDto(await reports.ToListAsync());

        }

        public async Task<ReportResponse> RemoveReport(Guid reportId)
        {
            var removedReport = await _repository.RemoveReport(reportId);
            return ReportMapper.ToDto(removedReport);
        }

        public async Task<ReportResponse> UpdateReport(Guid reportId, ReportAddRequest report)
        {
            var updatedReport = await _repository.UpdateReport(reportId,report);
            return ReportMapper.ToDto(updatedReport);
        }
    }
}
