
using FanPulseApi.Data;
using FanPulseApi.DTO;
using FanPulseApi.DTO.User.Validator;
using FanPulseApi.Exceptions;
using FanPulseApi.Middlewares;
using FanPulseApi.Models;
using FanPulseApi.Repositories;
using FanPulseApi.Repositories.Category;
using FanPulseApi.Repositories.Comment;
using FanPulseApi.Repositories.Likes;
using FanPulseApi.Repositories.Report;
using FanPulseApi.Repositories.User;
using FanPulseApi.Services;
using FanPulseApi.Services.Auth;
using FanPulseApi.Services.Category;
using FanPulseApi.Services.Comment;
using FanPulseApi.Services.Email;
using FanPulseApi.Services.Like;
using FanPulseApi.Services.Post;
using FanPulseApi.Services.Report;
using FanPulseApi.Services.User;
using FanPulseApi.Validators;
using FanPulseApi.Validators.Specification;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Resend;

namespace FanPulseApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("NextJsPolicy", policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:3000",
                            "https://main.d2pc57axofhk5v.amplifyapp.com"
                        )
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

            builder.Services.AddOptions();
            builder.Services.AddHttpClient<ResendClient>();

            builder.Services.Configure<ResendClientOptions>(options =>
            {
                options.ApiToken = builder.Configuration["Resend:ApiKey"]!;
            });

            builder.Services.AddTransient<IResend, ResendClient>();
            builder.Services.AddScoped<IEmailSender, ResendEmailSender>();


            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                });
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
