using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CasecApi.Data;
using CasecApi.Models;

namespace CasecApi.Controllers;

[ApiController]
[Route("[controller]")]
public class DeploymentsController : ControllerBase
{
    private readonly CasecDbContext _context;
    private readonly IConfiguration _configuration;

    public DeploymentsController(CasecDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>
    /// GET /api/deployments — Public deployment history (most recent first)
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int limit = 50)
    {
        try
        {
            var deployments = await _context.Deployments
                .OrderByDescending(d => d.DeployedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(new { success = true, data = deployments, total = deployments.Count });
        }
        catch
        {
            // Table might not exist yet
            return Ok(new { success = true, data = Array.Empty<object>(), total = 0 });
        }
    }

    /// <summary>
    /// POST /api/deployments — Record a new deployment (deploy key or admin only)
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> RecordDeployment([FromBody] RecordDeploymentRequest request)
    {
        if (!IsAdminOrDeployKey())
            return Unauthorized(new { message = "Admin role or Deploy API key required" });

        var deployment = new Deployment
        {
            Summary = request.Summary ?? "Deployment",
            CommitHash = request.CommitHash,
            Branch = request.Branch ?? "main",
            DeployedBy = request.DeployedBy ?? "GitHub Actions",
            Status = request.Status ?? "success",
            DurationSeconds = request.DurationSeconds,
            DeployedAt = DateTime.UtcNow
        };

        _context.Deployments.Add(deployment);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = deployment });
    }

    private bool IsAdminOrDeployKey()
    {
        var key = Request.Headers["X-Deploy-Key"].FirstOrDefault()
                  ?? Request.Query["key"].FirstOrDefault();
        var configuredKey = _configuration["Deploy:ApiKey"];

        if (!string.IsNullOrEmpty(configuredKey) && key == configuredKey)
            return true;

        return User.IsInRole("Admin");
    }

    public class RecordDeploymentRequest
    {
        public string? Summary { get; set; }
        public string? CommitHash { get; set; }
        public string? Branch { get; set; }
        public string? DeployedBy { get; set; }
        public string? Status { get; set; }
        public int? DurationSeconds { get; set; }
    }
}
