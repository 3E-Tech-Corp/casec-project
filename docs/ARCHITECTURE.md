# CASEC System Architecture & Design

## System Overview

The CASEC Membership Management System is a three-tier web application designed for scalability, maintainability, and data-driven configuration.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Frontend Web Application (HTML/JS/CSS)         │  │
│  │  - Single Page Application                            │  │
│  │  - Responsive Design                                  │  │
│  │  - JWT Token Management                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION TIER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         .NET 8 Core Web API                           │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Controllers Layer                              │  │  │
│  │  │  - AuthController (Auth endpoints)             │  │  │
│  │  │  - MembershipTypesController (Admin config)    │  │  │
│  │  │  - ClubsController (Club management)           │  │  │
│  │  │  - EventsController (Event management)         │  │  │
│  │  │  - UsersController (Profile management)        │  │  │
│  │  │  - PaymentsController (Payment processing)     │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic & Services                      │  │  │
│  │  │  - Authentication & JWT Generation             │  │  │
│  │  │  - Authorization & Role Checking               │  │  │
│  │  │  - Data Validation                             │  │  │
│  │  │  - Activity Logging                            │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Data Access Layer (EF Core)                   │  │  │
│  │  │  - CasecDbContext                              │  │  │
│  │  │  - Entity Models                               │  │  │
│  │  │  - LINQ Queries                                │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL/ADO.NET
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA TIER                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Microsoft SQL Server Database                 │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Core Tables                                    │  │  │
│  │  │  - Users (with authentication)                  │  │  │
│  │  │  - MembershipTypes (configurable)              │  │  │
│  │  │  - Clubs (configurable)                        │  │  │
│  │  │  - Events (configurable)                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Relationship Tables                            │  │  │
│  │  │  - ClubMemberships                             │  │  │
│  │  │  - EventRegistrations                          │  │  │
│  │  │  - FamilyMembers                               │  │  │
│  │  │  - MembershipPayments                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Supporting Tables                              │  │  │
│  │  │  - ActivityLog                                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Views & Stored Procedures                      │  │  │
│  │  │  - vw_UserDashboard                            │  │  │
│  │  │  - vw_ClubStatistics                           │  │  │
│  │  │  - vw_EventStatistics                          │  │  │
│  │  │  - sp_RegisterUser                             │  │  │
│  │  │  - sp_ProcessMembershipPayment                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Entity Relationship Diagram

```
┌─────────────────────┐
│  MembershipTypes    │
│─────────────────────│
│ PK MembershipTypeId │
│    Name             │◄───────────┐
│    Description      │            │
│    AnnualFee        │            │ FK
│    MaxFamilyMembers │            │
│    Permissions...   │            │
└─────────────────────┘            │
                                   │
┌─────────────────────┐            │
│      Users          │────────────┘
│─────────────────────│
│ PK UserId           │
│    FirstName        │
│    LastName         │
│    Email (UNIQUE)   │◄─────┬─────┬─────┬─────┐
│    PasswordHash     │      │     │     │     │
│    Profile Info...  │      │     │     │     │
│ FK MembershipTypeId │      │     │     │     │
│    IsAdmin          │      │     │     │     │
└─────────────────────┘      │     │     │     │
         │                   │     │     │     │
         │ FK                │     │     │     │
         ▼                   │     │     │     │
┌─────────────────────┐      │     │     │     │
│   FamilyMembers     │      │     │     │     │
│─────────────────────│      │     │     │     │
│ PK FamilyMemberId   │      │     │     │     │
│ FK UserId           │      │     │     │     │
│    FirstName        │      │     │     │     │
│    LastName         │      │     │     │     │
│    Relationship     │      │     │     │     │
└─────────────────────┘      │     │     │     │
                             │     │     │     │
┌─────────────────────┐      │     │     │     │
│      Clubs          │◄─────┘     │     │     │
│─────────────────────│            │     │     │
│ PK ClubId           │            │     │     │
│    Name (UNIQUE)    │            │     │     │
│    Description      │            │     │     │
│    Icon             │            │     │     │
│    Meeting Info...  │            │     │     │
│    MaxMembers       │            │     │     │
│ FK CreatedById      │            │     │     │
└─────────────────────┘            │     │     │
         │                         │     │     │
         │ FK                      │     │     │
         ▼                         │     │     │
┌─────────────────────┐            │     │     │
│  ClubMemberships    │◄───────────┘     │     │
│─────────────────────│                  │     │
│ PK ClubMembershipId │                  │     │
│ FK ClubId           │                  │     │
│ FK UserId           │                  │     │
│    Role             │                  │     │
│    JoinedAt         │                  │     │
│    IsActive         │                  │     │
└─────────────────────┘                  │     │
                                         │     │
┌─────────────────────┐                  │     │
│      Events         │◄─────────────────┘     │
│─────────────────────│                        │
│ PK EventId          │                        │
│    Title            │                        │
│    Description      │                        │
│    EventDate        │                        │
│    Location         │                        │
│    MaxAttendees     │                        │
│    EventFee         │                        │
│ FK CreatedById      │                        │
└─────────────────────┘                        │
         │                                     │
         │ FK                                  │
         ▼                                     │
┌─────────────────────┐                        │
│ EventRegistrations  │◄───────────────────────┘
│─────────────────────│
│ PK RegistrationId   │
│ FK EventId          │
│ FK UserId           │
│    NumberOfGuests   │
│    TotalAmount      │
│    PaymentStatus    │
└─────────────────────┘

┌─────────────────────┐
│ MembershipPayments  │◄───────────────────────┐
│─────────────────────│                        │
│ PK PaymentId        │                        │
│ FK UserId           │────────────────────────┘
│ FK MembershipTypeId │
│    Amount           │
│    PaymentDate      │
│    ValidFrom/Until  │
└─────────────────────┘

┌─────────────────────┐
│   ActivityLog       │
│─────────────────────│
│ PK LogId            │
│ FK UserId (NULL)    │
│    ActivityType     │
│    Description      │
│    IpAddress        │
│    CreatedAt        │
└─────────────────────┘
```

## API Architecture

### REST API Design Principles

1. **Resource-Based URLs**: Each entity has its own controller
2. **HTTP Methods**: Standard CRUD operations
3. **Status Codes**: Proper HTTP status codes
4. **JSON Format**: All requests/responses use JSON
5. **JWT Authentication**: Stateless token-based auth
6. **Role-Based Authorization**: Admin vs User permissions

### API Endpoint Structure

```
/api/auth/
├── POST /register          # User registration
└── POST /login             # User authentication

/api/membershiptypes/       # Admin configurable
├── GET  /                  # List all types
├── GET  /{id}              # Get specific type
├── POST /                  # Create new type (Admin)
├── PUT  /{id}              # Update type (Admin)
└── DELETE /{id}            # Delete type (Admin)

/api/clubs/                 # Admin configurable
├── GET  /                  # List all clubs
├── GET  /{id}              # Get specific club
├── GET  /my-clubs          # Current user's clubs
├── POST /                  # Create club (Admin)
├── PUT  /{id}              # Update club (Admin)
├── DELETE /{id}            # Delete club (Admin)
├── POST /{id}/join         # Join a club
└── POST /{id}/leave        # Leave a club

/api/events/
├── GET  /                  # List all events
├── GET  /{id}              # Get specific event
├── GET  /my-events         # Current user's events
├── POST /                  # Create event (Admin/Director)
├── PUT  /{id}              # Update event (Admin/Director)
├── DELETE /{id}            # Delete event (Admin/Director)
├── POST /{id}/register     # Register for event
└── POST /{id}/unregister   # Unregister from event

/api/users/
├── GET  /profile           # Get current user profile
├── PUT  /profile           # Update profile
└── GET  /dashboard         # Get dashboard data

/api/payments/
├── POST /process           # Process membership payment
└── GET  /history           # Get payment history
```

### Request/Response Flow

```
1. Client Request
   ├── Headers: Authorization: Bearer {JWT}
   ├── Method: POST
   ├── URL: /api/clubs/5/join
   └── Body: {}

2. API Middleware Pipeline
   ├── CORS Validation
   ├── JWT Authentication
   ├── Role Authorization
   └── Request Logging

3. Controller Action
   ├── Extract User ID from JWT Claims
   ├── Validate Request Data
   ├── Check Business Rules
   └── Call Service/Repository

4. Data Access Layer
   ├── EF Core LINQ Query
   ├── Database Transaction
   └── Return Results

5. Response Formation
   ├── Map to DTO
   ├── Format as JSON
   └── Add Status Code

6. Client Response
   ├── Status: 200 OK
   ├── Headers: Content-Type: application/json
   └── Body: { "success": true, "data": {...} }
```

## Security Architecture

### Authentication Flow

```
1. User Registration
   ┌────────┐         ┌────────┐         ┌──────────┐
   │ Client │         │  API   │         │ Database │
   └───┬────┘         └───┬────┘         └────┬─────┘
       │                  │                   │
       │ POST /register   │                   │
       ├─────────────────►│                   │
       │                  │                   │
       │                  │ Validate Data     │
       │                  │                   │
       │                  │ Hash Password     │
       │                  │ (BCrypt)          │
       │                  │                   │
       │                  │ INSERT User       │
       │                  ├──────────────────►│
       │                  │                   │
       │                  │ User Created      │
       │                  │◄──────────────────┤
       │                  │                   │
       │                  │ Generate JWT      │
       │                  │                   │
       │ JWT Token        │                   │
       │◄─────────────────┤                   │
       │                  │                   │

2. User Login
   ┌────────┐         ┌────────┐         ┌──────────┐
   │ Client │         │  API   │         │ Database │
   └───┬────┘         └───┬────┘         └────┬─────┘
       │                  │                   │
       │ POST /login      │                   │
       ├─────────────────►│                   │
       │                  │                   │
       │                  │ SELECT User       │
       │                  ├──────────────────►│
       │                  │                   │
       │                  │ User Data         │
       │                  │◄──────────────────┤
       │                  │                   │
       │                  │ Verify Password   │
       │                  │ (BCrypt)          │
       │                  │                   │
       │                  │ Generate JWT      │
       │                  │                   │
       │ JWT Token        │                   │
       │◄─────────────────┤                   │
       │                  │                   │

3. Authenticated Request
   ┌────────┐         ┌────────┐         ┌──────────┐
   │ Client │         │  API   │         │ Database │
   └───┬────┘         └───┬────┘         └────┬─────┘
       │                  │                   │
       │ GET /dashboard   │                   │
       │ + Bearer Token   │                   │
       ├─────────────────►│                   │
       │                  │                   │
       │                  │ Validate JWT      │
       │                  │ Extract Claims    │
       │                  │                   │
       │                  │ Check Permissions │
       │                  │                   │
       │                  │ Query Data        │
       │                  ├──────────────────►│
       │                  │                   │
       │                  │ Results           │
       │                  │◄──────────────────┤
       │                  │                   │
       │ JSON Response    │                   │
       │◄─────────────────┤                   │
       │                  │                   │
```

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Claims):
{
  "sub": "123",                          # UserId
  "email": "user@example.com",
  "name": "John Doe",
  "role": "User",                        # or "Admin"
  "MembershipTypeId": "1",
  "iat": 1638360000,
  "exp": 1638964800,                     # 7 days
  "iss": "CasecApi",
  "aud": "CasecApp"
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Authorization Levels

```
┌──────────────────────────────────────────────────┐
│                    Admin                         │
│  • Full system access                            │
│  • Manage membership types (CRUD)                │
│  • Manage all clubs (CRUD)                       │
│  • Manage all events (CRUD)                      │
│  • View all users                                │
│  • Access admin endpoints                        │
└──────────────────────────────────────────────────┘
                     │
                     │ includes
                     ▼
┌──────────────────────────────────────────────────┐
│                  Director                        │
│  • All User permissions                          │
│  • Create and manage own clubs                   │
│  • Create and manage own events                  │
│  • Up to 4 family members                        │
│  • Board voting rights                           │
└──────────────────────────────────────────────────┘
                     │
                     │ includes
                     ▼
┌──────────────────────────────────────────────────┐
│                   Family                         │
│  • All Individual permissions                    │
│  • Up to 4 family members                        │
│  • Family event discounts                        │
└──────────────────────────────────────────────────┘
                     │
                     │ includes
                     ▼
┌──────────────────────────────────────────────────┐
│                 Individual                       │
│  • View and update own profile                   │
│  • Join/leave clubs                              │
│  • Register for events                           │
│  • Process payments                              │
│  • View own dashboard                            │
└──────────────────────────────────────────────────┘
```

## Data-Driven Configuration

### Admin-Configurable Entities

The system allows runtime configuration of key entities without code changes:

```
MembershipTypes (Admin Panel)
├── Create new membership tiers
├── Adjust pricing dynamically
├── Set permissions per tier
├── Control family member limits
└── Activate/deactivate tiers

Clubs (Admin Panel)
├── Create new clubs
├── Update club details
├── Set meeting schedules
├── Control capacity
└── Activate/deactivate clubs

Events (Admin/Director Panel)
├── Create events
├── Set dates and locations
├── Manage capacity
├── Set pricing
└── Activate/deactivate events
```

### Configuration Flow

```
Admin makes change via API
         │
         ▼
Data saved to database
         │
         ▼
Change reflected immediately
         │
         ▼
No application restart needed
         │
         ▼
Frontend fetches updated data
```

## Deployment Architecture

### Development Environment
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Browser   │────►│  .NET Dev       │────►│  SQL Server     │
│   (localhost)   │     │  Server         │     │  LocalDB        │
│   :8080         │     │  :5001          │     │  (local)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Production Environment (Example)
```
┌──────────────────┐
│   Load Balancer  │
│   (SSL/TLS)      │
└────────┬─────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼───┐  ┌───▼───┐       ┌──────────────┐
│  API  │  │  API  │──────►│  Azure SQL   │
│ Node1 │  │ Node2 │       │  Database    │
└───────┘  └───────┘       └──────────────┘
    │          │
    └────┬─────┘
         │
┌────────▼─────────┐
│   Static Web     │
│   Frontend       │
│   (CDN)          │
└──────────────────┘
```

## Performance Considerations

### Database Optimization
- Indexed columns: Email, ClubId, UserId, EventDate
- Views for complex queries
- Stored procedures for common operations
- Connection pooling enabled

### API Optimization
- Response caching for static data
- Pagination for large lists
- Async/await throughout
- DTO projections to minimize data transfer

### Scalability
- Stateless API (JWT tokens)
- Horizontal scaling possible
- Database replication support
- CDN for static files

---

**Last Updated**: December 2024
**Version**: 1.0.0
