using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CasecApi.Models;

[Table("_MigrationHistory")]
public class MigrationHistory
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string ScriptName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Folder { get; set; } = string.Empty;

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public bool Success { get; set; }

    [MaxLength(2000)]
    public string? ErrorMessage { get; set; }

    public int DurationMs { get; set; }
}
