using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using CasecApi.Data;
using CasecApi.Models.DTOs;
using UserEntity = CasecApi.Models.User;
using CasecApi.Models;

namespace CasecApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CasecDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(CasecDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "Email already registered"
                });
            }

            // Validate membership type
            var membershipType = await _context.MembershipTypes
                .FirstOrDefaultAsync(mt => mt.MembershipTypeId == request.MembershipTypeId && mt.IsActive);

            if (membershipType == null)
            {
                return BadRequest(new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "Invalid membership type"
                });
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create user
            var user = new UserEntity
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                Profession = request.Profession,
                Hobbies = request.Hobbies,
                Bio = request.Bio,
                MembershipTypeId = request.MembershipTypeId,
                IsAdmin = false,
                MemberSince = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Add family members if any
            if (request.FamilyMembers != null && request.FamilyMembers.Any())
            {
                foreach (var fm in request.FamilyMembers)
                {
                    var familyMember = new FamilyMember
                    {
                        UserId = user.UserId,
                        FirstName = fm.FirstName,
                        LastName = fm.LastName,
                        DateOfBirth = fm.DateOfBirth,
                        Relationship = fm.Relationship
                    };
                    _context.FamilyMembers.Add(familyMember);
                }
                await _context.SaveChangesAsync();
            }

            // Log activity
            await LogActivity(user.UserId, "Registration", "User registered successfully");

            // Generate token
            var token = GenerateJwtToken(user);

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                State = user.State,
                ZipCode = user.ZipCode,
                Profession = user.Profession,
                Hobbies = user.Hobbies,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                MembershipTypeId = user.MembershipTypeId,
                MembershipTypeName = membershipType.Name,
                IsAdmin = user.IsAdmin,
                MemberSince = user.MemberSince
            };

            return Ok(new ApiResponse<LoginResponse>
            {
                Success = true,
                Message = "Registration successful",
                Data = new LoginResponse { Token = token, User = userDto }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "An error occurred during registration"
            });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.MembershipType)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "Account is inactive. Please contact support."
                });
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(user.UserId, "Login", "User logged in successfully");

            // Generate token
            var token = GenerateJwtToken(user);

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                City = user.City,
                State = user.State,
                ZipCode = user.ZipCode,
                Profession = user.Profession,
                Hobbies = user.Hobbies,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                MembershipTypeId = user.MembershipTypeId,
                MembershipTypeName = user.MembershipType?.Name ?? "",
                IsAdmin = user.IsAdmin,
                MemberSince = user.MemberSince
            };

            return Ok(new ApiResponse<LoginResponse>
            {
                Success = true,
                Message = "Login successful",
                Data = new LoginResponse { Token = token, User = userDto }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new ApiResponse<LoginResponse>
            {
                Success = false,
                Message = "An error occurred during login"
            });
        }
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? "DefaultSecretKeyForDevelopmentOnly123!"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
            new Claim("MembershipTypeId", user.MembershipTypeId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "CasecApi",
            audience: _configuration["Jwt:Audience"] ?? "CasecApp",
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task LogActivity(int userId, string activityType, string description)
    {
        try
        {
            var log = new ActivityLog
            {
                UserId = userId,
                ActivityType = activityType,
                Description = description,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            };
            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging activity");
        }
    }
}
