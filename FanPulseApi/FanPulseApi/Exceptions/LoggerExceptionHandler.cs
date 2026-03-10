using Microsoft.AspNetCore.Diagnostics;

namespace FanPulseApi.Exceptions
{
    public class LoggerExceptionHandler : IExceptionHandler
    {

        private readonly ILogger _logger;

        public LoggerExceptionHandler(ILogger logger)
        {
            _logger = logger;
        }
        public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            

            _logger.LogError(exception, $"Unhandled exception.\n " +
                $"Time Stamp: ${DateTimeOffset.UtcNow}\n" +
                $"Request End point: ${httpContext.Request.Path}\n" +
                $"Request Method: ${httpContext.Request.Method}\n" +
                $"Ip Adress: ${httpContext.Connection.RemoteIpAddress}\n" +
                $"", exception.Message);

            

            return new ValueTask<bool>(true);

        }
    }
}
