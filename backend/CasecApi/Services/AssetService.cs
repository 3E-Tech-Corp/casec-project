using System.Data;
using System.Text.RegularExpressions;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using CasecApi.Data;
using CasecApi.Models;

namespace CasecApi.Services;

public class AssetService : IAssetService
{
    private readonly CasecDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly FileStorageSettings _storageSettings;
    private readonly IAssetFileTypeService _fileTypeService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<AssetService> _logger;

    // Regex to detect GUID-style filenames (e.g. "a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg")
    private static readonly Regex GuidFileNameRegex = new Regex(
        @"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.\w+$",
        RegexOptions.Compiled);

    public AssetService(
        CasecDbContext context,
        IFileStorageService fileStorage,
        IOptions<FileStorageSettings> storageSettings,
        IAssetFileTypeService fileTypeService,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<AssetService> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _storageSettings = storageSettings.Value;
        _fileTypeService = fileTypeService;
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    private IDbConnection CreateConnection() =>
        new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));

    public async Task<AssetUploadResult> UploadAssetAsync(
        IFormFile file,
        string folder,
        string? objectType = null,
        int? objectId = null,
        int? uploadedBy = null)
    {
        try
        {
            // Validate using DB-driven file types
            var extension = Path.GetExtension(file.FileName);
            var validationError = await _fileTypeService.ValidateFileAsync(file.ContentType, extension, file.Length);
            if (validationError != null)
            {
                return new AssetUploadResult { Success = false, Error = validationError };
            }

            // Step 1: Create asset record FIRST to get the FileId
            var asset = new Asset
            {
                FileName = "pending",          // will update after upload
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                StorageProvider = _storageSettings.Provider,
                StoragePath = "pending",       // will update after upload
                Folder = folder,
                ObjectType = objectType,
                ObjectId = objectId,
                UploadedBy = uploadedBy,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();

            // Step 2: Build the new filename: {fileId}{extension}
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var newFileName = $"{asset.FileId}{ext}";

            // Step 3: Build sub-folder using creation date: folder/YYYY-MM
            var dateFolder = asset.CreatedAt.ToString("yyyy-MM");
            var targetFolder = $"{folder}/{dateFolder}";

            // Step 4: Upload file with the FileId-based name
            var uploadResult = await _fileStorage.UploadFileAsync(file, targetFolder, newFileName);

            if (!uploadResult.Success)
            {
                // Rollback: remove the asset record
                _context.Assets.Remove(asset);
                await _context.SaveChangesAsync();

                return new AssetUploadResult
                {
                    Success = false,
                    Error = uploadResult.Error
                };
            }

            // Step 5: Update asset record with final path
            var storagePath = $"{targetFolder}/{newFileName}";
            asset.FileName = newFileName;
            asset.StoragePath = storagePath;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Asset created: FileId={FileId}, Path={Path}", asset.FileId, storagePath);

            return new AssetUploadResult
            {
                Success = true,
                FileId = asset.FileId,
                Url = $"/asset/{asset.FileId}",
                FileSize = asset.FileSize,
                ContentType = asset.ContentType,
                OriginalFileName = asset.OriginalFileName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading asset");
            return new AssetUploadResult
            {
                Success = false,
                Error = "An error occurred while uploading the file"
            };
        }
    }

    public async Task<bool> DeleteAssetAsync(int fileId)
    {
        try
        {
            var asset = await _context.Assets.FindAsync(fileId);
            if (asset == null || asset.IsDeleted)
                return false;

            asset.IsDeleted = true;
            asset.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Asset soft deleted: FileId={FileId}", fileId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting asset {FileId}", fileId);
            return false;
        }
    }

    public async Task<Asset?> GetAssetAsync(int fileId)
    {
        return await _context.Assets.FindAsync(fileId);
    }

    public async Task<List<Asset>> GetAssetsByObjectAsync(string objectType, int objectId)
    {
        return await Task.FromResult(
            _context.Assets
                .Where(a => a.ObjectType == objectType && a.ObjectId == objectId && !a.IsDeleted)
                .OrderByDescending(a => a.CreatedAt)
                .ToList()
        );
    }

    // ====================================================================
    // Browse / Stats / Meta / Bulk Delete (Phase 2a)
    // ====================================================================

    public async Task<AssetBrowseResult> BrowseAssetsAsync(AssetBrowseRequest request)
    {
        using var db = CreateConnection();

        using var multi = await db.QueryMultipleAsync(
            "csp_Assets_Browse",
            new
            {
                request.Page,
                request.PageSize,
                ContentTypeFilter = request.ContentTypeFilter,
                request.Folder,
                request.ObjectType,
                request.DateFrom,
                request.DateTo,
                request.Search,
                request.IncludeDeleted
            },
            commandType: CommandType.StoredProcedure);

        var totalCount = await multi.ReadFirstAsync<int>();
        var items = (await multi.ReadAsync<Asset>()).ToList();

        return new AssetBrowseResult
        {
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            Items = items
        };
    }

    public async Task<AssetStatsResult> GetStatsAsync()
    {
        using var db = CreateConnection();

        using var multi = await db.QueryMultipleAsync(
            "csp_Assets_GetStats",
            commandType: CommandType.StoredProcedure);

        var totals = await multi.ReadFirstAsync<dynamic>();
        var byCategory = (await multi.ReadAsync<CategoryStat>()).ToList();
        var byFolder = (await multi.ReadAsync<FolderStat>()).ToList();

        return new AssetStatsResult
        {
            TotalAssets = (int)totals.TotalAssets,
            ActiveAssets = (int)totals.ActiveAssets,
            DeletedAssets = (int)totals.DeletedAssets,
            TotalSizeBytes = (long)totals.TotalSizeBytes,
            ByCategory = byCategory,
            ByFolder = byFolder
        };
    }

    public async Task<Asset?> UpdateMetaAsync(int fileId, AssetMetaUpdateDto dto)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<Asset>(
            "csp_Assets_UpdateMeta",
            new
            {
                FileId = fileId,
                dto.Caption,
                dto.SortOrder,
                dto.Status
            },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<int> BulkDeleteAsync(int[] fileIds)
    {
        if (fileIds == null || fileIds.Length == 0) return 0;

        using var db = CreateConnection();
        var idsString = string.Join(",", fileIds);
        var result = await db.QueryFirstOrDefaultAsync<dynamic>(
            "csp_Assets_BulkSoftDelete",
            new { FileIds = idsString },
            commandType: CommandType.StoredProcedure);

        return (int)(result?.RowsAffected ?? 0);
    }

    // ====================================================================
    // Migration Tool (Phase 1c)
    // ====================================================================

    public async Task<MigrationReport> PreviewMigrationAsync()
    {
        return await RunMigrationInternal(preview: true);
    }

    public async Task<MigrationReport> ExecuteMigrationAsync()
    {
        return await RunMigrationInternal(preview: false);
    }

    private async Task<MigrationReport> RunMigrationInternal(bool preview)
    {
        var report = new MigrationReport { IsPreview = preview };

        // Get all assets
        using var db = CreateConnection();
        var assets = (await db.QueryAsync<Asset>(
            "csp_Assets_GetForMigration",
            commandType: CommandType.StoredProcedure)).ToList();

        report.TotalAssets = assets.Count;

        var basePath = GetBasePath();

        foreach (var asset in assets)
        {
            var fileName = Path.GetFileName(asset.StoragePath);

            // Check if this file needs migration (has GUID filename)
            if (!GuidFileNameRegex.IsMatch(fileName))
            {
                report.AlreadyMigrated++;
                continue;
            }

            report.NeedsMigration++;

            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            var dateFolder = asset.CreatedAt.ToString("yyyy-MM");
            var folder = asset.Folder ?? "misc";
            var newFileName = $"{asset.FileId}{ext}";
            var newRelativePath = $"{folder}/{dateFolder}/{newFileName}";

            var item = new MigrationItem
            {
                FileId = asset.FileId,
                OldPath = asset.StoragePath,
                NewPath = newRelativePath,
                Status = preview ? "pending" : "processing"
            };

            if (!preview)
            {
                try
                {
                    var oldFullPath = Path.Combine(basePath, asset.StoragePath);
                    var newFullPath = Path.Combine(basePath, newRelativePath);

                    if (!File.Exists(oldFullPath))
                    {
                        item.Status = "file_not_found";
                        item.Error = $"Source file not found: {oldFullPath}";
                        report.FileNotFoundCount++;
                        report.Items.Add(item);
                        continue;
                    }

                    // Ensure target directory exists
                    var targetDir = Path.GetDirectoryName(newFullPath)!;
                    Directory.CreateDirectory(targetDir);

                    // Copy file to new location
                    File.Copy(oldFullPath, newFullPath, overwrite: true);

                    // Update DB record
                    await db.ExecuteAsync(
                        "csp_Assets_UpdateStoragePath",
                        new
                        {
                            FileId = asset.FileId,
                            NewStoragePath = newRelativePath,
                            NewFileName = newFileName
                        },
                        commandType: CommandType.StoredProcedure);

                    // Move old file to backup folder
                    var backupDir = Path.Combine(basePath, "_migration_backup", folder);
                    Directory.CreateDirectory(backupDir);
                    var backupPath = Path.Combine(backupDir, fileName);
                    if (File.Exists(oldFullPath))
                    {
                        File.Move(oldFullPath, backupPath, overwrite: true);
                    }

                    item.Status = "success";
                    report.SuccessCount++;
                }
                catch (Exception ex)
                {
                    item.Status = "error";
                    item.Error = ex.Message;
                    report.ErrorCount++;
                    _logger.LogError(ex, "Migration error for FileId={FileId}", asset.FileId);
                }
            }
            else
            {
                item.Status = "pending";
            }

            report.Items.Add(item);
        }

        return report;
    }

    private string GetBasePath()
    {
        var localSettings = _storageSettings.Local ?? new LocalStorageSettings();
        var basePath = localSettings.BasePath;
        if (!Path.IsPathRooted(basePath))
        {
            basePath = Path.Combine(_environment.ContentRootPath, basePath);
        }
        return basePath;
    }
}
