
using FanPulseApi.Data;
using FanPulseApi.Models;
using FanPulseApi.Repositories;
using FanPulseApi.Repositories.User;
using FanPulseApi.Services;
using FanPulseApi.Services.Post;
using FanPulseApi.Services.User;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

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
            
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
            
            //User
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            
            //Post
            builder.Services.AddScoped<IPostRepository, PostRepository>();
            builder.Services.AddScoped<IPostService, PostService>();
           



            var app = builder.Build();

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
