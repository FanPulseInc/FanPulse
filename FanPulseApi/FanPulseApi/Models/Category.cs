using System.ComponentModel.DataAnnotations;

namespace FanPulseApi.Models;

public class Category
{
    public Guid Id { get; set; }
    
    public Guid? ParentId { get; set; }
    
    public Category? Parent { get; set; }
    
    public required string Name { get; set; }

    public ICollection<Category> Children { get; set; } = new List<Category>();
    
    public ICollection<User> Users { get; set; } = new List<User>(); 

}