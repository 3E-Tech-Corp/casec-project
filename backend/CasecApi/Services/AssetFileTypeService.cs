using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;
using CasecApi.Models;

namespace CasecApi.Services;

public interface IAssetFileTypeService
{
    Task<IEnumerable<AssetFileType>> GetAllAsync();
    Task<IEnumerable<AssetFileType>> GetEnabledAsync();
    Task<AssetFileType?> GetByIdAsync(int id);
    Task<IEnumerable<AssetFileType>> GetByCategoryAsync(string category);
    Task<AssetFileType?> CreateAsync(AssetFileTypeDto dto);
    Task<AssetFileType?> UpdateAsync(int id, AssetFileTypeDto dto);
    Task<bool> DeleteAsync(int id);
    Task<AssetFileType?> ToggleEnabledAsync(int id);

    /// <summary>
    /// Validates a file against the enabled file types. Returns null if valid, error message otherwise.
    /// </summary>
    Task<string?> ValidateFileAsync(string contentType, string extension, long fileSizeBytes);
}

public class AssetFileTypeService : IAssetFileTypeService
{
    private readonly string _connectionString;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AssetFileTypeService> _logger;

    private const string CacheKey = "AssetFileTypes_Enabled";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    // Fallback allowed types if DB is empty or unavailable
    private static readonly AssetFileType[] FallbackTypes = new[]
    {
        new AssetFileType { MimeType = "image/jpeg",      Extensions = ".jpg,.jpeg", Category = "Image",    MaxSizeMB = 20 },
        new AssetFileType { MimeType = "image/png",       Extensions = ".png",       Category = "Image",    MaxSizeMB = 20 },
        new AssetFileType { MimeType = "image/gif",       Extensions = ".gif",       Category = "Image",    MaxSizeMB = 10 },
        new AssetFileType { MimeType = "image/webp",      Extensions = ".webp",      Category = "Image",    MaxSizeMB = 20 },
        new AssetFileType { MimeType = "image/svg+xml",   Extensions = ".svg",       Category = "Image",    MaxSizeMB = 5  },
        new AssetFileType { MimeType = "video/mp4",       Extensions = ".mp4",       Category = "Video",    MaxSizeMB = 100 },
        new AssetFileType { MimeType = "video/webm",      Extensions = ".webm",      Category = "Video",    MaxSizeMB = 100 },
        new AssetFileType { MimeType = "video/ogg",       Extensions = ".ogg",       Category = "Video",    MaxSizeMB = 100 },
        new AssetFileType { MimeType = "video/quicktime",  Extensions = ".mov",      Category = "Video",    MaxSizeMB = 100 },
        new AssetFileType { MimeType = "application/pdf", Extensions = ".pdf",       Category = "Document", MaxSizeMB = 20 },
        new AssetFileType { MimeType = "application/msword", Extensions = ".doc",    Category = "Document", MaxSizeMB = 20 },
        new AssetFileType { MimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document", Extensions = ".docx", Category = "Document", MaxSizeMB = 20 },
    };

    public AssetFileTypeService(IConfiguration configuration, IMemoryCache cache, ILogger<AssetFileTypeService> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");
        _cache = cache;
        _logger = logger;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<AssetFileType>> GetAllAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<AssetFileType>("csp_AssetFileTypes_GetAll", commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<AssetFileType>> GetEnabledAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<AssetFileType>("csp_AssetFileTypes_GetEnabled", commandType: CommandType.StoredProcedure);
    }

    public async Task<AssetFileType?> GetByIdAsync(int id)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<AssetFileType>(
            "csp_AssetFileTypes_GetById",
            new { Id = id },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<AssetFileType>> GetByCategoryAsync(string category)
    {
        using var db = CreateConnection();
        return await db.QueryAsync<AssetFileType>(
            "csp_AssetFileTypes_GetByCategory",
            new { Category = category },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<AssetFileType?> CreateAsync(AssetFileTypeDto dto)
    {
        using var db = CreateConnection();
        var result = await db.QueryFirstOrDefaultAsync<AssetFileType>(
            "csp_AssetFileTypes_Create",
            new
            {
                dto.MimeType,
                dto.Extensions,
                dto.Category,
                dto.MaxSizeMB,
                dto.IsEnabled,
                dto.DisplayName
            },
            commandType: CommandType.StoredProcedure);

        InvalidateCache();
        return result;
    }

    public async Task<AssetFileType?> UpdateAsync(int id, AssetFileTypeDto dto)
    {
        using var db = CreateConnection();
        var result = await db.QueryFirstOrDefaultAsync<AssetFileType>(
            "csp_AssetFileTypes_Update",
            new
            {
                Id = id,
                dto.MimeType,
                dto.Extensions,
                dto.Category,
                dto.MaxSizeMB,
                dto.IsEnabled,
                dto.DisplayName
            },
            commandType: CommandType.StoredProcedure);

        InvalidateCache();
        return result;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var db = CreateConnection();
        var result = await db.QueryFirstOrDefaultAsync<dynamic>(
            "csp_AssetFileTypes_Delete",
            new { Id = id },
            commandType: CommandType.StoredProcedure);

        InvalidateCache();
        return result?.RowsAffected > 0;
    }

    public async Task<AssetFileType?> ToggleEnabledAsync(int id)
    {
        using var db = CreateConnection();
        var result = await db.QueryFirstOrDefaultAsync<AssetFileType>(
            "csp_AssetFileTypes_ToggleEnabled",
            new { Id = id },
            commandType: CommandType.StoredProcedure);

        InvalidateCache();
        return result;
    }

    public async Task<string?> ValidateFileAsync(string contentType, string extension, long fileSizeBytes)
    {
        var enabledTypes = await GetCachedEnabledTypesAsync();

        // Normalize extension
        var ext = extension.ToLowerInvariant();
        if (!ext.StartsWith(".")) ext = "." + ext;

        // Find matching type by mime type or extension
        var matchingType = enabledTypes.FirstOrDefault(t =>
            t.MimeType.Equals(contentType, StringComparison.OrdinalIgnoreCase) ||
            t.GetExtensionArray().Any(e => e.Equals(ext, StringComparison.OrdinalIgnoreCase)));

        if (matchingType == null)
        {
            return $"File type '{extension}' ({contentType}) is not allowed";
        }

        var maxBytes = (long)matchingType.MaxSizeMB * 1024 * 1024;
        if (fileSizeBytes > maxBytes)
        {
            return $"File size exceeds the {matchingType.MaxSizeMB}MB limit for {matchingType.DisplayName}";
        }

        return null; // Valid
    }

    private async Task<IEnumerable<AssetFileType>> GetCachedEnabledTypesAsync()
    {
        if (_cache.TryGetValue(CacheKey, out IEnumerable<AssetFileType>? cached) && cached != null)
        {
            return cached;
        }

        try
        {
            var types = await GetEnabledAsync();
            var typesList = types.ToList();

            if (typesList.Count == 0)
            {
                _logger.LogWarning("No enabled AssetFileTypes found in DB, using fallback");
                return FallbackTypes;
            }

            _cache.Set(CacheKey, typesList, CacheDuration);
            return typesList;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading AssetFileTypes from DB, using fallback");
            return FallbackTypes;
        }
    }

    private void InvalidateCache()
    {
        _cache.Remove(CacheKey);
    }
}
