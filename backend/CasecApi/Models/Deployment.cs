using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CasecApi.Models;

[Table("Deployments")]
public class Deployment
{
    [Key]
    public int DeploymentId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Summary { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? CommitHash { get; set; }

    [MaxLength(100)]
    public string Branch { get; set; } = "main";

    [MaxLength(100)]
    public string DeployedBy { get; set; } = "GitHub Actions";

    [MaxLength(20)]
    public string Status { get; set; } = "success";

    public int? DurationSeconds { get; set; }

    public DateTime DeployedAt { get; set; } = DateTime.UtcNow;
}
