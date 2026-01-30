using CasecApi.Models;

namespace CasecApi.Services;

public interface IAssetService
{
    /// <summary>
    /// Uploads a file and creates an asset record in the database
    /// </summary>
    Task<AssetUploadResult> UploadAssetAsync(
        IFormFile file,
        string folder,
        string? objectType = null,
        int? objectId = null,
        int? uploadedBy = null);

    /// <summary>
    /// Deletes an asset by ID (soft delete)
    /// </summary>
    Task<bool> DeleteAssetAsync(int fileId);

    /// <summary>
    /// Gets an asset by ID
    /// </summary>
    Task<Asset?> GetAssetAsync(int fileId);

    /// <summary>
    /// Gets assets by object type and ID
    /// </summary>
    Task<List<Asset>> GetAssetsByObjectAsync(string objectType, int objectId);

    /// <summary>
    /// Browse assets with pagination and filters
    /// </summary>
    Task<AssetBrowseResult> BrowseAssetsAsync(AssetBrowseRequest request);

    /// <summary>
    /// Get asset statistics (counts, sizes, by category/folder)
    /// </summary>
    Task<AssetStatsResult> GetStatsAsync();

    /// <summary>
    /// Update asset metadata (caption, sort order, status)
    /// </summary>
    Task<Asset?> UpdateMetaAsync(int fileId, AssetMetaUpdateDto dto);

    /// <summary>
    /// Bulk soft delete assets
    /// </summary>
    Task<int> BulkDeleteAsync(int[] fileIds);

    /// <summary>
    /// Preview what would be migrated (old GUID paths → new FileId paths)
    /// </summary>
    Task<MigrationReport> PreviewMigrationAsync();

    /// <summary>
    /// Execute migration of old GUID paths to new FileId paths
    /// </summary>
    Task<MigrationReport> ExecuteMigrationAsync();
}

public class AssetUploadResult
{
    public bool Success { get; set; }
    public int? FileId { get; set; }
    public string? Url { get; set; }
    public string? Error { get; set; }
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
    public string? OriginalFileName { get; set; }
}

public class AssetBrowseRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string? ContentTypeFilter { get; set; }   // "image", "video", "document", or full mime
    public string? Folder { get; set; }
    public string? ObjectType { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? Search { get; set; }
    public bool IncludeDeleted { get; set; } = false;
}

public class AssetBrowseResult
{
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public List<Asset> Items { get; set; } = new();
}

public class AssetStatsResult
{
    public int TotalAssets { get; set; }
    public int ActiveAssets { get; set; }
    public int DeletedAssets { get; set; }
    public long TotalSizeBytes { get; set; }
    public List<CategoryStat> ByCategory { get; set; } = new();
    public List<FolderStat> ByFolder { get; set; } = new();
}

public class CategoryStat
{
    public string Category { get; set; } = string.Empty;
    public int FileCount { get; set; }
    public long TotalSizeBytes { get; set; }
}

public class FolderStat
{
    public string Folder { get; set; } = string.Empty;
    public int FileCount { get; set; }
    public long TotalSizeBytes { get; set; }
}

public class AssetMetaUpdateDto
{
    public string? Caption { get; set; }
    public int? SortOrder { get; set; }
    public string? Status { get; set; }
}

public class MigrationReport
{
    public bool IsPreview { get; set; }
    public int TotalAssets { get; set; }
    public int NeedsMigration { get; set; }
    public int AlreadyMigrated { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public int FileNotFoundCount { get; set; }
    public List<MigrationItem> Items { get; set; } = new();
}

public class MigrationItem
{
    public int FileId { get; set; }
    public string OldPath { get; set; } = string.Empty;
    public string NewPath { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;  // "pending", "success", "error", "skipped", "file_not_found"
    public string? Error { get; set; }
}
