using FanPulseApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FanPulseApi.Data;

public sealed class FanPusleDbContext : DbContext
{
    public FanPusleDbContext(DbContextOptions<FanPusleDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    
    public DbSet<Role> Roles { get; set; } = null!;
    
    public DbSet<Report> Reports { get; set; } = null!;
    
    public DbSet<PostLike> PostLikes { get; set; } = null!;
    
    public DbSet<Post> Posts { get; set; } = null!;
    
    public DbSet<Comment> Comments { get; set; } = null!;
    
    public DbSet<Category> Categories { get; set; } = null!;
    
    
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FanPusleDbContext).Assembly);
    }
}