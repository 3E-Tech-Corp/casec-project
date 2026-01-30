using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using CasecApi.Data;
using CasecApi.Models;
using System.Diagnostics;

namespace CasecApi.Controllers;

[ApiController]
[Route("admin/migrations")]
public class MigrationsController : ControllerBase
{
    private readonly CasecDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MigrationsController> _logger;

    // SQL folders to scan (relative to content root)
    private static readonly string[] MigrationFolders = { "Database", "Migrations" };

    public MigrationsController(
        CasecDbContext context,
        IConfiguration configuration,
        ILogger<MigrationsController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Verify deploy API key from header or query param.
    /// </summary>
    private bool IsAuthorized()
    {
        // Check X-Deploy-Key header first, then query param
        var key = Request.Headers["X-Deploy-Key"].FirstOrDefault()
                  ?? Request.Query["key"].FirstOrDefault();

        var configuredKey = _configuration["Deploy:ApiKey"];

        if (string.IsNullOrEmpty(configuredKey))
        {
            _logger.LogWarning("Deploy:ApiKey not configured. Migration endpoint disabled.");
            return false;
        }

        return !string.IsNullOrEmpty(key) && key == configuredKey;
    }

    /// <summary>
    /// Check admin role OR deploy API key.
    /// </summary>
    private bool IsAdminOrDeployKey()
    {
        return User.IsInRole("Admin") || IsAuthorized();
    }

    /// <summary>
    /// GET /api/admin/migrations/status
    /// Show all scripts and their applied/pending status.
    /// </summary>
    [HttpGet("status")]
    [AllowAnonymous] // Auth checked manually (supports both JWT admin + API key)
    public async Task<IActionResult> GetStatus()
    {
        if (!IsAdminOrDeployKey())
            return Unauthorized(new { message = "Admin role or Deploy API key required" });

        await EnsureMigrationTable();

        var applied = await _context.Set<MigrationHistory>()
            .OrderBy(m => m.Folder)
            .ThenBy(m => m.ScriptName)
            .ToListAsync();

        var allScripts = GetAllScripts();
        var appliedNames = applied
            .Where(a => a.Success)
            .Select(a => $"{a.Folder}/{a.ScriptName}")
            .ToHashSet();

        var status = allScripts.Select(s => new
        {
            folder = s.Folder,
            script = s.FileName,
            status = appliedNames.Contains($"{s.Folder}/{s.FileName}") ? "applied" : "pending",
            appliedAt = applied
                .FirstOrDefault(a => a.Folder == s.Folder && a.ScriptName == s.FileName && a.Success)
                ?.AppliedAt
        }).ToList();

        return Ok(new
        {
            total = status.Count,
            applied = status.Count(s => s.status == "applied"),
            pending = status.Count(s => s.status == "pending"),
            scripts = status
        });
    }

    /// <summary>
    /// POST /api/admin/migrations/run
    /// Execute all pending migration scripts in order.
    /// Optionally pass ?script=020_AddProgramRatings.sql to run a specific one.
    /// </summary>
    [HttpPost("run")]
    [AllowAnonymous]
    public async Task<IActionResult> RunMigrations([FromQuery] string? script = null)
    {
        if (!IsAdminOrDeployKey())
            return Unauthorized(new { message = "Admin role or Deploy API key required" });

        await EnsureMigrationTable();

        var applied = await _context.Set<MigrationHistory>()
            .Where(m => m.Success)
            .Select(m => $"{m.Folder}/{m.ScriptName}")
            .ToListAsync();

        var appliedSet = applied.ToHashSet();
        var allScripts = GetAllScripts();

        // Filter to specific script if requested
        List<ScriptInfo> toRun;
        if (!string.IsNullOrEmpty(script))
        {
            toRun = allScripts
                .Where(s => s.FileName.Equals(script, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (toRun.Count == 0)
                return NotFound(new { message = $"Script not found: {script}" });
        }
        else
        {
            // Only numbered scripts (NNN_Name.sql) auto-run; skip SampleData_* etc.
            toRun = allScripts
                .Where(s => !appliedSet.Contains($"{s.Folder}/{s.FileName}"))
                .Where(s => char.IsDigit(s.FileName[0]))
                .ToList();
        }

        if (toRun.Count == 0)
            return Ok(new { message = "No pending migrations", applied = applied.Count });

        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var results = new List<object>();

        foreach (var s in toRun)
        {
            var sw = Stopwatch.StartNew();
            var record = new MigrationHistory
            {
                ScriptName = s.FileName,
                Folder = s.Folder,
                AppliedAt = DateTime.UtcNow
            };

            try
            {
                var sql = await System.IO.File.ReadAllTextAsync(s.FullPath);
                _logger.LogInformation("Running migration: {Folder}/{Script}", s.Folder, s.FileName);

                // Use raw ADO.NET for multi-statement scripts with GO separators
                await ExecuteSqlScript(connectionString!, sql);

                sw.Stop();
                record.Success = true;
                record.DurationMs = (int)sw.ElapsedMilliseconds;

                results.Add(new
                {
                    script = s.FileName,
                    folder = s.Folder,
                    status = "success",
                    durationMs = record.DurationMs
                });

                _logger.LogInformation("Migration completed: {Folder}/{Script} in {Ms}ms",
                    s.Folder, s.FileName, record.DurationMs);
            }
            catch (Exception ex)
            {
                sw.Stop();
                record.Success = false;
                record.DurationMs = (int)sw.ElapsedMilliseconds;
                record.ErrorMessage = ex.Message.Length > 2000
                    ? ex.Message[..2000]
                    : ex.Message;

                results.Add(new
                {
                    script = s.FileName,
                    folder = s.Folder,
                    status = "failed",
                    error = record.ErrorMessage,
                    durationMs = record.DurationMs
                });

                _logger.LogError(ex, "Migration failed: {Folder}/{Script}", s.Folder, s.FileName);

                // Save the failure record and stop
                _context.Set<MigrationHistory>().Add(record);
                await _context.SaveChangesAsync();

                return StatusCode(500, new
                {
                    message = $"Migration failed at {s.FileName}",
                    results
                });
            }

            _context.Set<MigrationHistory>().Add(record);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            message = $"Successfully ran {results.Count} migration(s)",
            results
        });
    }

    /// <summary>
    /// POST /api/admin/migrations/run-sql
    /// Execute arbitrary SQL (admin + deploy key only). For emergency fixes.
    /// </summary>
    [HttpPost("run-sql")]
    [AllowAnonymous]
    public async Task<IActionResult> RunArbitrarySql([FromBody] RunSqlRequest request)
    {
        if (!IsAdminOrDeployKey())
            return Unauthorized(new { message = "Admin role or Deploy API key required" });

        if (string.IsNullOrWhiteSpace(request.Sql))
            return BadRequest(new { message = "SQL is required" });

        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var sw = Stopwatch.StartNew();

        try
        {
            await ExecuteSqlScript(connectionString!, request.Sql);
            sw.Stop();

            return Ok(new
            {
                message = "SQL executed successfully",
                durationMs = (int)sw.ElapsedMilliseconds
            });
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Arbitrary SQL execution failed");
            return StatusCode(500, new
            {
                message = "SQL execution failed",
                error = ex.Message,
                durationMs = (int)sw.ElapsedMilliseconds
            });
        }
    }

    /// <summary>
    /// Execute a SQL script that may contain GO batch separators.
    /// </summary>
    private static async Task ExecuteSqlScript(string connectionString, string sql)
    {
        // Split on GO (case-insensitive, must be on its own line)
        var batches = System.Text.RegularExpressions.Regex.Split(sql,
            @"^\s*GO\s*$",
            System.Text.RegularExpressions.RegexOptions.Multiline |
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        foreach (var batch in batches)
        {
            var trimmed = batch.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;

            using var command = new SqlCommand(trimmed, connection);
            command.CommandTimeout = 120; // 2 min per batch
            await command.ExecuteNonQueryAsync();
        }
    }

    /// <summary>
    /// Ensure the _MigrationHistory table exists.
    /// </summary>
    private async Task EnsureMigrationTable()
    {
        var sql = @"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '_MigrationHistory')
            BEGIN
                CREATE TABLE _MigrationHistory (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    ScriptName NVARCHAR(255) NOT NULL,
                    Folder NVARCHAR(50) NOT NULL DEFAULT '',
                    AppliedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                    Success BIT NOT NULL DEFAULT 1,
                    ErrorMessage NVARCHAR(2000) NULL,
                    DurationMs INT NOT NULL DEFAULT 0
                );
                CREATE INDEX IX_MigrationHistory_Script ON _MigrationHistory (Folder, ScriptName);
            END";

        await _context.Database.ExecuteSqlRawAsync(sql);
    }

    /// <summary>
    /// Scan all SQL script files from known folders.
    /// </summary>
    private List<ScriptInfo> GetAllScripts()
    {
        var scripts = new List<ScriptInfo>();
        var contentRoot = Path.Combine(AppContext.BaseDirectory);

        foreach (var folder in MigrationFolders)
        {
            var folderPath = Path.Combine(contentRoot, folder);
            if (!Directory.Exists(folderPath)) continue;

            var files = Directory.GetFiles(folderPath, "*.sql")
                .Select(f => new ScriptInfo
                {
                    FileName = Path.GetFileName(f),
                    Folder = folder,
                    FullPath = f
                })
                .OrderBy(f => f.FileName);

            scripts.AddRange(files);
        }

        return scripts;
    }

    private class ScriptInfo
    {
        public string FileName { get; set; } = string.Empty;
        public string Folder { get; set; } = string.Empty;
        public string FullPath { get; set; } = string.Empty;
    }

    public class RunSqlRequest
    {
        public string Sql { get; set; } = string.Empty;
    }
}
