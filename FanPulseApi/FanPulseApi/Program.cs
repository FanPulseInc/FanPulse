
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
using FanPulseApi.DTO.User.Validator;
using FanPulseApi.Repositories.Category;
using FanPulseApi.Repositories.Comment;
using FanPulseApi.Repositories.Likes;
using FanPulseApi.Repositories.User;
using FanPulseApi.Services.Category;
using FanPulseApi.Services.User;
using FanPulseApi.Validators.Specification;
using FanPulseApi.Repositories.Report;
using FanPulseApi.Services.Auth;
using FanPulseApi.Services.Like;
using FanPulseApi.Services.Report;
using FluentValidation;

namespace FanPulseApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            var nextJsAppUrl = builder.Configuration["AllowedOrigins:NextJsApp"] ?? "http://localhost:3000";
            var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
            
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("NextJsPolicy", policy =>
                {
                    policy.WithOrigins(nextJsAppUrl)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); 
                });
            });
           
            builder.Services.AddDbContext<FanPusleDbContext>(options =>
                options.UseNpgsql(connectionString));


            builder.Services.AddSingleton<IBadWordsProvider, BadWordsProvider>();
            builder.Services.AddSingleton<ISpecification<string>,ProfanityFilterSpec>();
            builder.Services.AddSingleton<ISpecification<OwnerCheckRequest>, IsOwnerSpec>();

            
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddScoped<IAuthService, AuthService>();
            
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            
            builder.Services.AddScoped<ICommentRepository, CommentRepository>();
            builder.Services.AddScoped<ICommentService, CommentService>();
            
            builder.Services.AddScoped<ILikeRepository, LikeRepository>();
            builder.Services.AddScoped<ILikeService, LikeService>();
            
            builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
            
            builder.Services.AddScoped<IPostRepository, PostRepository>();
            builder.Services.AddScoped<IPostService, PostService>();

            builder.Services.AddScoped<IReportRepository, ReportRepository>();
            builder.Services.AddScoped<IReportService, ReportService>();
           
            //This code will automatically register any validators, no need for more registration
            builder.Services.AddValidatorsFromAssemblyContaining<UserAddRequestValidator>();


            var jwtKey = builder.Configuration["Jwt:Key"] ?? "Temporary_Local_Dev_Key_32_Chars_Long!!!";
            builder.Services.AddAuthentication("Bearer")
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtKey)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                    };
                });

            var app = builder.Build();
            
            app.UseCors("NextJsPolicy");
            
            app.UseMiddleware<BusinessExceptionMiddleware>();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

           
            app.UseAuthentication();
            app.UseAuthorization();
            
            app.MapControllers();

            app.Run();
        }
    }
}
