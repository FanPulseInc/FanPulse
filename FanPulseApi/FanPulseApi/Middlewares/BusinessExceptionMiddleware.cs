using FanPulseApi.Exceptions;

namespace FanPulseApi.Middlewares
{
    public class BusinessExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public BusinessExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                
                await _next(context);
            }
            catch (BusinessRuleException ex)
            {
            
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                context.Response.ContentType = "application/json";

                var response = new { error = ex.Message };
                await context.Response.WriteAsJsonAsync(response);
            }
            catch (Exception ex)
            {
               
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

               
            }
        }
    }
}
