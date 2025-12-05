using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CasecApi.Data;
using UserEntity = CasecApi.Models.User;
using CasecApi.Models;
using CasecApi.Models.DTOs;

namespace CasecApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly CasecDbContext _context;
    private readonly ILogger<EventsController> _logger;

    public EventsController(CasecDbContext context, ILogger<EventsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    // GET: api/Events
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<EventDto>>>> GetEvents(
        [FromQuery] string? eventType = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? featured = null,
        [FromQuery] bool? upcoming = true)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var query = _context.Events.AsQueryable();

            // Filter by event type
            if (!string.IsNullOrEmpty(eventType))
            {
                query = query.Where(e => e.EventType == eventType);
            }

            // Filter by category
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(e => e.EventCategory == category);
            }

            // Filter by featured
            if (featured.HasValue)
            {
                query = query.Where(e => e.IsFeatured == featured.Value);
            }

            // Filter by upcoming/past
            if (upcoming.HasValue && upcoming.Value)
            {
                query = query.Where(e => e.EventDate >= DateTime.UtcNow);
            }

            var events = await query
                .OrderBy(e => e.EventDate)
                .Select(e => new EventDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    Location = e.Location,
                    EventType = e.EventType,
                    EventCategory = e.EventCategory,
                    EventScope = e.EventScope,
                    HostClubId = e.HostClubId,
                    HostClubName = e.HostClub != null ? e.HostClub.Name : null,
                    HostClubAvatar = e.HostClub != null ? e.HostClub.AvatarUrl : null,
                    PartnerName = e.PartnerName,
                    PartnerLogo = e.PartnerLogo,
                    PartnerWebsite = e.PartnerWebsite,
                    RegistrationUrl = e.RegistrationUrl,
                    EventFee = e.EventFee,
                    MaxCapacity = e.MaxCapacity,
                    IsRegistrationRequired = e.IsRegistrationRequired,
                    IsFeatured = e.IsFeatured,
                    TotalRegistrations = _context.EventRegistrations.Count(er => er.EventId == e.EventId),
                    SpotsRemaining = e.MaxCapacity - _context.EventRegistrations.Count(er => er.EventId == e.EventId),
                    IsUserRegistered = currentUserId > 0 && 
                        _context.EventRegistrations.Any(er => er.EventId == e.EventId && er.UserId == currentUserId),
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();

            return Ok(new ApiResponse<List<EventDto>>
            {
                Success = true,
                Data = events
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching events");
            return StatusCode(500, new ApiResponse<List<EventDto>>
            {
                Success = false,
                Message = "An error occurred while fetching events"
            });
        }
    }

    // GET: api/Events/{id}
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EventDto>>> GetEvent(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound(new ApiResponse<EventDto>
                {
                    Success = false,
                    Message = "Event not found"
                });
            }

            var eventDto = new EventDto
            {
                EventId = eventItem.EventId,
                Title = eventItem.Title,
                Description = eventItem.Description,
                EventDate = eventItem.EventDate,
                Location = eventItem.Location,
                EventType = eventItem.EventType,
                EventCategory = eventItem.EventCategory,
                PartnerName = eventItem.PartnerName,
                PartnerLogo = eventItem.PartnerLogo,
                PartnerWebsite = eventItem.PartnerWebsite,
                RegistrationUrl = eventItem.RegistrationUrl,
                EventFee = eventItem.EventFee,
                MaxCapacity = eventItem.MaxCapacity,
                IsRegistrationRequired = eventItem.IsRegistrationRequired,
                IsFeatured = eventItem.IsFeatured,
                TotalRegistrations = await _context.EventRegistrations.CountAsync(er => er.EventId == id),
                SpotsRemaining = eventItem.MaxCapacity - await _context.EventRegistrations.CountAsync(er => er.EventId == id),
                IsUserRegistered = currentUserId > 0 && 
                    await _context.EventRegistrations.AnyAsync(er => er.EventId == id && er.UserId == currentUserId),
                CreatedAt = eventItem.CreatedAt
            };

            return Ok(new ApiResponse<EventDto>
            {
                Success = true,
                Data = eventDto
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching event");
            return StatusCode(500, new ApiResponse<EventDto>
            {
                Success = false,
                Message = "An error occurred while fetching event"
            });
        }
    }

    // POST: api/Events (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<EventDto>>> CreateEvent([FromBody] CreateEventRequest request)
    {
        try
        {
            var eventItem = new Event
            {
                Title = request.Title,
                Description = request.Description,
                EventDate = request.EventDate,
                Location = request.Location,
                EventType = request.EventType ?? "CasecEvent",
                EventCategory = request.EventCategory,
                EventScope = request.EventScope ?? "AllMembers",
                HostClubId = request.HostClubId,
                PartnerName = request.PartnerName,
                PartnerLogo = request.PartnerLogo,
                PartnerWebsite = request.PartnerWebsite,
                RegistrationUrl = request.RegistrationUrl,
                EventFee = request.EventFee,
                MaxCapacity = request.MaxCapacity,
                IsRegistrationRequired = request.IsRegistrationRequired,
                IsFeatured = request.IsFeatured
            };

            _context.Events.Add(eventItem);
            await _context.SaveChangesAsync();

            // Log activity
            var currentUserId = GetCurrentUserId();
            var log = new ActivityLog
            {
                UserId = currentUserId,
                ActivityType = "EventCreated",
                Description = $"Created event: {eventItem.Title} (Type: {eventItem.EventType})"
            };
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<EventDto>
            {
                Success = true,
                Message = "Event created successfully",
                Data = new EventDto { EventId = eventItem.EventId }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating event");
            return StatusCode(500, new ApiResponse<EventDto>
            {
                Success = false,
                Message = "An error occurred while creating event"
            });
        }
    }

    // PUT: api/Events/{id} (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateEvent(int id, [FromBody] UpdateEventRequest request)
    {
        try
        {
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Event not found"
                });
            }

            eventItem.Title = request.Title ?? eventItem.Title;
            eventItem.Description = request.Description ?? eventItem.Description;
            eventItem.EventDate = request.EventDate ?? eventItem.EventDate;
            eventItem.Location = request.Location ?? eventItem.Location;
            eventItem.EventType = request.EventType ?? eventItem.EventType;
            eventItem.EventCategory = request.EventCategory;
            eventItem.PartnerName = request.PartnerName;
            eventItem.PartnerLogo = request.PartnerLogo;
            eventItem.PartnerWebsite = request.PartnerWebsite;
            eventItem.RegistrationUrl = request.RegistrationUrl;
            eventItem.EventFee = request.EventFee ?? eventItem.EventFee;
            eventItem.MaxCapacity = request.MaxCapacity ?? eventItem.MaxCapacity;
            eventItem.IsRegistrationRequired = request.IsRegistrationRequired ?? eventItem.IsRegistrationRequired;
            eventItem.IsFeatured = request.IsFeatured ?? eventItem.IsFeatured;

            await _context.SaveChangesAsync();

            // Log activity
            var currentUserId = GetCurrentUserId();
            var log = new ActivityLog
            {
                UserId = currentUserId,
                ActivityType = "EventUpdated",
                Description = $"Updated event: {eventItem.Title}"
            };
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Event updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating event");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred while updating event"
            });
        }
    }

    // POST: api/Events/{id}/register
    [HttpPost("{id}/register")]
    public async Task<ActionResult<ApiResponse<object>>> RegisterForEvent(int id, [FromBody] EventRegistrationRequest request)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Event not found"
                });
            }

            // Check if event requires registration
            if (!eventItem.IsRegistrationRequired)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "This event does not require registration"
                });
            }

            // Check if event type allows registration
            if (eventItem.EventType == "Announcement")
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Cannot register for announcement-only events"
                });
            }

            // Check if already registered
            var existingRegistration = await _context.EventRegistrations
                .FirstOrDefaultAsync(er => er.EventId == id && er.UserId == currentUserId);

            if (existingRegistration != null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "You are already registered for this event"
                });
            }

            // Check capacity
            var currentRegistrations = await _context.EventRegistrations.CountAsync(er => er.EventId == id);
            if (currentRegistrations >= eventItem.MaxCapacity)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Event is at full capacity"
                });
            }

            var registration = new EventRegistration
            {
                EventId = id,
                UserId = currentUserId,
                NumberOfGuests = request.NumberOfGuests,
                RegistrationDate = DateTime.UtcNow,
                PaymentStatus = eventItem.EventFee > 0 ? "Pending" : "Free"
            };

            _context.EventRegistrations.Add(registration);
            await _context.SaveChangesAsync();

            // Log activity
            var log = new ActivityLog
            {
                UserId = currentUserId,
                ActivityType = "EventRegistration",
                Description = $"Registered for event: {eventItem.Title}"
            };
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Successfully registered for event"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering for event");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred while registering for event"
            });
        }
    }

    // GET: api/Events/types
    [AllowAnonymous]
    [HttpGet("types")]
    public ActionResult<ApiResponse<List<EventTypeInfo>>> GetEventTypes()
    {
        var types = new List<EventTypeInfo>
        {
            new EventTypeInfo 
            { 
                Type = "CasecEvent", 
                DisplayName = "CASEC Event", 
                Description = "Official CASEC community events",
                Icon = "🎉",
                AllowsRegistration = true
            },
            new EventTypeInfo 
            { 
                Type = "PartnerEvent", 
                DisplayName = "Partner Event", 
                Description = "Events hosted by our partners",
                Icon = "🤝",
                AllowsRegistration = true
            },
            new EventTypeInfo 
            { 
                Type = "Announcement", 
                DisplayName = "Announcement", 
                Description = "Information and updates (view only)",
                Icon = "📢",
                AllowsRegistration = false
            }
        };

        return Ok(new ApiResponse<List<EventTypeInfo>>
        {
            Success = true,
            Data = types
        });
    }

    // GET: api/Events/categories
    [AllowAnonymous]
    [HttpGet("categories")]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetEventCategories()
    {
        try
        {
            var categories = await _context.Events
                .Where(e => !string.IsNullOrEmpty(e.EventCategory))
                .Select(e => e.EventCategory!)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(new ApiResponse<List<string>>
            {
                Success = true,
                Data = categories
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching categories");
            return StatusCode(500, new ApiResponse<List<string>>
            {
                Success = false,
                Message = "An error occurred while fetching categories"
            });
        }
    }
}
