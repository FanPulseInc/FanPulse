using Resend;

namespace FanPulseApi.Services.Email
{
    public class ResendEmailSender : IEmailSender
    {
        private readonly IResend _resend;

        public ResendEmailSender(IResend resend)
        {
            _resend = resend;
        }

        public async Task SendEmailAsync(string to, string subject, string html)
        {
            var message = new EmailMessage
            {
                From = "FanPulse <no-reply@natsukashi.xyz>",
                To = [to],
                Subject = subject,
                HtmlBody = html,
                

            };

            await _resend.EmailSendAsync(message);
        }
    };

}
