using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CasecApi.Data;
using CasecApi.Models;
using CasecApi.Services;

namespace CasecApi.Controllers;

[ApiController]
[Route("[controller]")]
public class AssetController : ControllerBase
{
    private readonly CasecDbContext _context;
    private readonly IAssetService _assetService;
    private readonly IFileStorageService _fileStorage;
    private readonly FileStorageSettings _storageSettings;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AssetController> _logger;

    public AssetController(
        CasecDbContext context,
        IAssetService assetService,
        IFileStorageService fileStorage,
        IOptions<FileStorageSettings> storageSettings,
        IWebHostEnvironment environment,
        ILogger<AssetController> logger)
    {
        _context = context;
        _assetService = assetService;
        _fileStorage = fileStorage;
        _storageSettings = storageSettings.Value;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Get a file by its ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAsset(int id)
    {
        try
        {
            var asset = await _context.Assets
                .FirstOrDefaultAsync(a => a.FileId == id && !a.IsDeleted);

            if (asset == null)
                return NotFound(new { message = "Asset not found" });

            if (asset.StorageProvider.Equals("S3", StringComparison.OrdinalIgnoreCase))
            {
                return Redirect(asset.StoragePath);
            }
            else
            {
                var localSettings = _storageSettings.Local ?? new LocalStorageSettings();
                var basePath = localSettings.BasePath;
                if (!Path.IsPathRooted(basePath))
                    basePath = Path.Combine(_environment.ContentRootPath, basePath);

                var filePath = Path.Combine(basePath, asset.StoragePath);
                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning("Asset file not found on disk: {FilePath}", filePath);
                    return NotFound(new { message = "File not found on disk" });
                }

                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                if (asset.ContentType != null && asset.ContentType.StartsWith("image/"))
                    return File(fileStream, asset.ContentType);

                return File(fileStream, asset.ContentType, asset.OriginalFileName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving asset {AssetId}", id);
            return StatusCode(500, new { message = "Error retrieving file" });
        }
    }

    /// <summary>
    /// Get asset metadata by ID
    /// </summary>
    [HttpGet("{id:int}/info")]
    public async Task<IActionResult> GetAssetInfo(int id)
    {
        try
        {
            var asset = await _context.Assets
                .FirstOrDefaultAsync(a => a.FileId == id && !a.IsDeleted);

            if (asset == null)
                return NotFound(new { message = "Asset not found" });

            return Ok(new
            {
                asset.FileId,
                asset.FileName,
                asset.OriginalFileName,
                asset.ContentType,
                asset.FileSize,
                asset.Folder,
                asset.ObjectType,
                asset.ObjectId,
                asset.Status,
                asset.SortOrder,
                asset.Caption,
                asset.CreatedAt,
                Url = $"/asset/{asset.FileId}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving asset info {AssetId}", id);
            return StatusCode(500, new { message = "Error retrieving asset info" });
        }
    }

    // ====================================================================
    // Phase 2a: Browse / Stats / Meta / Delete / Bulk Delete
    // ====================================================================

    /// <summary>
    /// Browse assets with pagination and filters (admin)
    /// </summary>
    [HttpGet("browse")]
    [Authorize]
    public async Task<IActionResult> Browse(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? type = null,
        [FromQuery] string? folder = null,
        [FromQuery] string? objectType = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] string? search = null,
        [FromQuery] bool includeDeleted = false)
    {
        try
        {
            var request = new AssetBrowseRequest
            {
                Page = Math.Max(1, page),
                PageSize = Math.Clamp(pageSize, 1, 200),
                ContentTypeFilter = type,
                Folder = folder,
                ObjectType = objectType,
                DateFrom = dateFrom,
                DateTo = dateTo,
                Search = search,
                IncludeDeleted = includeDeleted
            };

            var result = await _assetService.BrowseAssetsAsync(request);

            return Ok(new
            {
                result.TotalCount,
                result.Page,
                result.PageSize,
                result.TotalPages,
                items = result.Items.Select(a => new
                {
                    a.FileId,
                    a.FileName,
                    a.OriginalFileName,
                    a.ContentType,
                    a.FileSize,
                    a.StorageProvider,
                    a.StoragePath,
                    a.Folder,
                    a.ObjectType,
                    a.ObjectId,
                    a.UploadedBy,
                    a.Status,
                    a.SortOrder,
                    a.Caption,
                    a.CreatedAt,
                    a.IsDeleted,
                    a.DeletedAt,
                    Url = $"/asset/{a.FileId}",
                    ThumbnailUrl = a.ContentType?.StartsWith("image/") == true ? $"/asset/{a.FileId}" : null
                })
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error browsing assets");
            return StatusCode(500, new { message = "Error browsing assets" });
        }
    }

    /// <summary>
    /// Get asset statistics (admin)
    /// </summary>
    [HttpGet("stats")]
    [Authorize]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var stats = await _assetService.GetStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting asset stats");
            return StatusCode(500, new { message = "Error retrieving asset stats" });
        }
    }

    /// <summary>
    /// Update asset metadata (caption, sort order, status)
    /// </summary>
    [HttpPost("{id:int}/update-meta")]
    [Authorize]
    public async Task<IActionResult> UpdateMeta(int id, [FromBody] AssetMetaUpdateDto dto)
    {
        try
        {
            var result = await _assetService.UpdateMetaAsync(id, dto);
            if (result == null)
                return NotFound(new { message = "Asset not found" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating asset meta {AssetId}", id);
            return StatusCode(500, new { message = "Error updating asset metadata" });
        }
    }

    /// <summary>
    /// Soft delete a single asset
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _assetService.DeleteAssetAsync(id);
            if (!success)
                return NotFound(new { message = "Asset not found or already deleted" });

            return Ok(new { message = "Asset deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting asset {AssetId}", id);
            return StatusCode(500, new { message = "Error deleting asset" });
        }
    }

    /// <summary>
    /// Bulk soft delete assets
    /// </summary>
    [HttpPost("bulk-delete")]
    [Authorize]
    public async Task<IActionResult> BulkDelete([FromBody] int[] fileIds)
    {
        try
        {
            if (fileIds == null || fileIds.Length == 0)
                return BadRequest(new { message = "No file IDs provided" });

            var deleted = await _assetService.BulkDeleteAsync(fileIds);
            return Ok(new { message = $"{deleted} asset(s) deleted", deletedCount = deleted });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk deleting assets");
            return StatusCode(500, new { message = "Error bulk deleting assets" });
        }
    }

    // ====================================================================
    // Migration Tool (Phase 1c)
    // ====================================================================

    /// <summary>
    /// Preview what would be migrated (dry run)
    /// </summary>
    [HttpPost("migrate/preview")]
    [Authorize]
    public async Task<IActionResult> MigratePreview()
    {
        try
        {
            var report = await _assetService.PreviewMigrationAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error previewing migration");
            return StatusCode(500, new { message = "Error previewing migration" });
        }
    }

    /// <summary>
    /// Execute migration of old GUID paths to new FileId paths
    /// </summary>
    [HttpPost("migrate")]
    [Authorize]
    public async Task<IActionResult> Migrate()
    {
        try
        {
            var report = await _assetService.ExecuteMigrationAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing migration");
            return StatusCode(500, new { message = "Error executing migration" });
        }
    }
}
