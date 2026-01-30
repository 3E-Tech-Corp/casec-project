namespace CasecApi.Models;

/// <summary>
/// Represents an allowed file type for asset uploads.
/// Managed via the AssetFileTypes admin page.
/// </summary>
public class AssetFileType
{
    public int Id { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string Extensions { get; set; } = string.Empty;   // comma-separated, e.g. ".jpg,.jpeg"
    public string Category { get; set; } = string.Empty;     // Image, Video, Document, Audio
    public int MaxSizeMB { get; set; } = 20;
    public bool IsEnabled { get; set; } = true;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Returns the extensions as an array (e.g. [".jpg", ".jpeg"]).
    /// </summary>
    public string[] GetExtensionArray()
    {
        return Extensions.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}

/// <summary>
/// DTO for creating/updating an AssetFileType.
/// </summary>
public class AssetFileTypeDto
{
    public string MimeType { get; set; } = string.Empty;
    public string Extensions { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int MaxSizeMB { get; set; } = 20;
    public bool IsEnabled { get; set; } = true;
    public string DisplayName { get; set; } = string.Empty;
}
