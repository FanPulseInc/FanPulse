
using FanPulseApi.Data;
using FanPulseApi.Exceptions;
using FanPulseApi.Middlewares;
using FanPulseApi.Models;
using FanPulseApi.Repositories;
using FanPulseApi.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using FanPulseApi.Services.Comment;
using FanPulseApi.Validators;
using FanPulseApi.Services.Post;
using FanPulseApi.DTO;
using FanPulseApi.Validators.Specification;
namespace FanPulseApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
           
            builder.Services.AddDbContext<FanPusleDbContext>(options =>
                options.UseNpgsql(connectionString));


            builder.Services.AddSingleton<IBadWordsProvider, BadWordsProvider>();
            builder.Services.AddSingleton<ISpecification<string>,ProfanityFilterSpec>();
            builder.Services.AddSingleton<ISpecification<OwnerCheckRequest>, IsOwnerSpec>();

            
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            builder.Services.AddScoped<IPostRepository, PostRepository>();
            builder.Services.AddScoped<IPostService, PostService>();
           



            var app = builder.Build();
            app.UseMiddleware<BusinessExceptionMiddleware>();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

           

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
