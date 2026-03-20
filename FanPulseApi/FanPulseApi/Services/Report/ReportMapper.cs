using FanPulseApi.DTO;
using FanPulseApi.DTO.Report;
using FanPulseApi.Repositories.Report;
using FanPulseApi.Services.User;

namespace FanPulseApi.Services.Report
{
    public static class ReportMapper
    {
        public static ReportResponse ToDto(Models.Report report)
        {
            return new ReportResponse
            {
                description = report.description,
                ReportedUser = UserMapper.ToDto(report.ReportedUser),
                Reporter = UserMapper.ToDto(report.Reporter),
                CreatedAt = report.CreatedAt,
                UpdatedAt = report.UpdatedAt,
                Id = report.Id,



            };
        }

        public static List<ReportResponse> ToArrayDto(List<Models.Report> reports)
        {
            var list = new List<ReportResponse>();
            foreach (var report in reports )
            {
                list.Add(ToDto(report));
            }
            return list;
        }


    }
}
