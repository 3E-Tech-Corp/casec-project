using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CasecApi.Models;
using CasecApi.Services;

namespace CasecApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class AssetFileTypeController : ControllerBase
{
    private readonly IAssetFileTypeService _service;
    private readonly ILogger<AssetFileTypeController> _logger;

    public AssetFileTypeController(IAssetFileTypeService service, ILogger<AssetFileTypeController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all file types (admin)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var types = await _service.GetAllAsync();
            return Ok(types);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all asset file types");
            return StatusCode(500, new { message = "Error retrieving file types" });
        }
    }

    /// <summary>
    /// Get only enabled file types (public use during upload)
    /// </summary>
    [HttpGet("enabled")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEnabled()
    {
        try
        {
            var types = await _service.GetEnabledAsync();
            return Ok(types);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting enabled asset file types");
            return StatusCode(500, new { message = "Error retrieving file types" });
        }
    }

    /// <summary>
    /// Get file type by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var fileType = await _service.GetByIdAsync(id);
            if (fileType == null)
                return NotFound(new { message = "File type not found" });

            return Ok(fileType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting asset file type {Id}", id);
            return StatusCode(500, new { message = "Error retrieving file type" });
        }
    }

    /// <summary>
    /// Get file types by category (Image, Video, Document, Audio)
    /// </summary>
    [HttpGet("category/{category}")]
    public async Task<IActionResult> GetByCategory(string category)
    {
        try
        {
            var types = await _service.GetByCategoryAsync(category);
            return Ok(types);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting asset file types by category {Category}", category);
            return StatusCode(500, new { message = "Error retrieving file types" });
        }
    }

    /// <summary>
    /// Create a new file type
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AssetFileTypeDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.MimeType) || string.IsNullOrWhiteSpace(dto.Extensions) ||
                string.IsNullOrWhiteSpace(dto.Category) || string.IsNullOrWhiteSpace(dto.DisplayName))
            {
                return BadRequest(new { message = "MimeType, Extensions, Category, and DisplayName are required" });
            }

            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating asset file type");
            return StatusCode(500, new { message = "Error creating file type" });
        }
    }

    /// <summary>
    /// Update an existing file type
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AssetFileTypeDto dto)
    {
        try
        {
            var result = await _service.UpdateAsync(id, dto);
            if (result == null)
                return NotFound(new { message = "File type not found" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating asset file type {Id}", id);
            return StatusCode(500, new { message = "Error updating file type" });
        }
    }

    /// <summary>
    /// Delete a file type
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "File type not found" });

            return Ok(new { message = "File type deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting asset file type {Id}", id);
            return StatusCode(500, new { message = "Error deleting file type" });
        }
    }

    /// <summary>
    /// Toggle enabled/disabled state of a file type
    /// </summary>
    [HttpPost("{id:int}/toggle")]
    public async Task<IActionResult> ToggleEnabled(int id)
    {
        try
        {
            var result = await _service.ToggleEnabledAsync(id);
            if (result == null)
                return NotFound(new { message = "File type not found" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling asset file type {Id}", id);
            return StatusCode(500, new { message = "Error toggling file type" });
        }
    }
}
