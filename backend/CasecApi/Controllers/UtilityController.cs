using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using CasecApi.Models.DTOs;

namespace CasecApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UtilityController : ControllerBase
{
    private readonly ILogger<UtilityController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public UtilityController(ILogger<UtilityController> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Fetches metadata from a URL including Open Graph images, title, and description
    /// </summary>
    [HttpPost("fetch-url-metadata")]
    public async Task<ActionResult<ApiResponse<UrlMetadataDto>>> FetchUrlMetadata([FromBody] FetchUrlMetadataRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Url))
            {
                return BadRequest(new ApiResponse<UrlMetadataDto>
                {
                    Success = false,
                    Message = "URL is required"
                });
            }

            // Validate URL format
            if (!Uri.TryCreate(request.Url, UriKind.Absolute, out var uri) ||
                (uri.Scheme != "http" && uri.Scheme != "https"))
            {
                return BadRequest(new ApiResponse<UrlMetadataDto>
                {
                    Success = false,
                    Message = "Invalid URL format. Must be a valid HTTP or HTTPS URL."
                });
            }

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(10);
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            var response = await client.GetAsync(uri);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new ApiResponse<UrlMetadataDto>
                {
                    Success = false,
                    Message = $"Failed to fetch URL: {response.StatusCode}"
                });
            }

            var html = await response.Content.ReadAsStringAsync();
            var metadata = ParseHtmlMetadata(html, uri);

            return Ok(new ApiResponse<UrlMetadataDto>
            {
                Success = true,
                Data = metadata
            });
        }
        catch (TaskCanceledException)
        {
            return BadRequest(new ApiResponse<UrlMetadataDto>
            {
                Success = false,
                Message = "Request timed out. The URL may be slow or unreachable."
            });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Failed to fetch URL metadata for {Url}", request.Url);
            return BadRequest(new ApiResponse<UrlMetadataDto>
            {
                Success = false,
                Message = "Failed to fetch URL. The URL may be unreachable or blocked."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching URL metadata for {Url}", request.Url);
            return StatusCode(500, new ApiResponse<UrlMetadataDto>
            {
                Success = false,
                Message = "An error occurred while fetching URL metadata"
            });
        }
    }

    private UrlMetadataDto ParseHtmlMetadata(string html, Uri baseUri)
    {
        var metadata = new UrlMetadataDto
        {
            Url = baseUri.ToString()
        };

        // Extract Open Graph image
        metadata.ImageUrl = ExtractMetaContent(html, "og:image") ??
                           ExtractMetaContent(html, "twitter:image") ??
                           ExtractMetaContent(html, "twitter:image:src") ??
                           ExtractFirstImage(html, baseUri);

        // Extract title
        metadata.Title = ExtractMetaContent(html, "og:title") ??
                        ExtractMetaContent(html, "twitter:title") ??
                        ExtractHtmlTitle(html);

        // Extract description
        metadata.Description = ExtractMetaContent(html, "og:description") ??
                              ExtractMetaContent(html, "twitter:description") ??
                              ExtractMetaContent(html, "description");

        // Extract site name
        metadata.SiteName = ExtractMetaContent(html, "og:site_name") ??
                           ExtractMetaContent(html, "application-name");

        // Make sure image URL is absolute
        if (!string.IsNullOrEmpty(metadata.ImageUrl) && !metadata.ImageUrl.StartsWith("http"))
        {
            metadata.ImageUrl = new Uri(baseUri, metadata.ImageUrl).ToString();
        }

        return metadata;
    }

    private string? ExtractMetaContent(string html, string property)
    {
        // Try property attribute (Open Graph style)
        var propertyPattern = $@"<meta[^>]*property=[""']{Regex.Escape(property)}[""'][^>]*content=[""']([^""']+)[""'][^>]*/?>|<meta[^>]*content=[""']([^""']+)[""'][^>]*property=[""']{Regex.Escape(property)}[""'][^>]*/?>";
        var match = Regex.Match(html, propertyPattern, RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return match.Groups[1].Success ? match.Groups[1].Value : match.Groups[2].Value;
        }

        // Try name attribute (standard meta style)
        var namePattern = $@"<meta[^>]*name=[""']{Regex.Escape(property)}[""'][^>]*content=[""']([^""']+)[""'][^>]*/?>|<meta[^>]*content=[""']([^""']+)[""'][^>]*name=[""']{Regex.Escape(property)}[""'][^>]*/?>";
        match = Regex.Match(html, namePattern, RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return match.Groups[1].Success ? match.Groups[1].Value : match.Groups[2].Value;
        }

        return null;
    }

    private string? ExtractHtmlTitle(string html)
    {
        var match = Regex.Match(html, @"<title[^>]*>([^<]+)</title>", RegexOptions.IgnoreCase);
        return match.Success ? System.Net.WebUtility.HtmlDecode(match.Groups[1].Value.Trim()) : null;
    }

    private string? ExtractFirstImage(string html, Uri baseUri)
    {
        // Look for a prominent image - skip tiny images and icons
        var imgPattern = @"<img[^>]*src=[""']([^""']+)[""'][^>]*>";
        var matches = Regex.Matches(html, imgPattern, RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            var src = match.Groups[1].Value;

            // Skip common icon/tracking/placeholder patterns
            if (src.Contains("favicon") ||
                src.Contains("icon") ||
                src.Contains("logo") ||
                src.Contains("tracking") ||
                src.Contains("pixel") ||
                src.Contains("1x1") ||
                src.Contains("spacer") ||
                src.Contains("blank") ||
                src.Contains(".svg") ||
                src.Contains("data:image"))
            {
                continue;
            }

            // Make URL absolute
            if (!src.StartsWith("http"))
            {
                src = new Uri(baseUri, src).ToString();
            }

            return src;
        }

        return null;
    }
}

public class FetchUrlMetadataRequest
{
    public string Url { get; set; } = string.Empty;
}
