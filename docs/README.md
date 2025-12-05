# CASEC Membership Management System

A comprehensive membership management platform with .NET Core Web API backend, MS SQL Server database, and modern web frontend.

## System Architecture

### Technology Stack
- **Backend**: .NET 8.0 Web API
- **Database**: Microsoft SQL Server
- **Authentication**: JWT Bearer Tokens
- **Frontend**: Vanilla JavaScript with modern HTML5/CSS3
- **ORM**: Entity Framework Core 8.0

### Key Features

#### For All Users
- User registration with multiple membership types
- Profile management (profession, hobbies, bio)
- Club browsing and membership
- Event registration and tracking
- Payment processing for annual fees
- Family member management (Family & Director tiers)
- Personal dashboard with activity tracking

#### For Admins
- **Membership Type Management**: Create, update, deactivate membership tiers
- **Club Management**: Full CRUD operations on clubs
- **Event Management**: Create and manage community events
- **User Management**: View and manage member accounts
- **Data-Driven Configuration**: All membership types and clubs configurable via API

## Project Structure

```
casec-app/
├── Database/
│   └── CreateTables.sql          # Complete database schema with seed data
├── CasecApi/
│   ├── Controllers/
│   │   ├── AuthController.cs     # Registration & login
│   │   ├── MembershipTypesController.cs  # Admin management
│   │   ├── ClubsController.cs    # Club CRUD & membership
│   │   ├── EventsController.cs   # Event management
│   │   ├── UsersController.cs    # Profile & user data
│   │   └── PaymentsController.cs # Payment processing
│   ├── Models/
│   │   ├── Entities.cs           # Database models
│   │   └── DTOs.cs               # API request/response models
│   ├── Data/
│   │   └── CasecDbContext.cs     # EF Core DbContext
│   ├── CasecApi.csproj           # Project dependencies
│   ├── Program.cs                # Application startup
│   └── appsettings.json          # Configuration
└── wwwroot/
    └── index.html                # Frontend application

```

## Database Schema

### Core Tables

#### Users
- Primary user accounts with authentication
- Links to MembershipType
- Tracks profile information, admin status

#### MembershipTypes (Admin Configurable)
- **Fields**: Name, Description, AnnualFee, MaxFamilyMembers
- **Permissions**: CanManageClubs, CanManageEvents, HasBoardVotingRights
- **Display**: Icon, DisplayOrder, IsActive
- **Default Types**: Individual ($50), Family ($120), Director ($200)

#### Clubs (Admin Configurable)
- Club information and meeting details
- Member capacity management
- Active/inactive status
- Linked to creator (User)

#### Events
- Event details with date/time/location
- Registration management with capacity
- Fee structure and payment tracking
- Creator tracking (User)

#### Junction Tables
- ClubMemberships: User ↔ Club relationships
- EventRegistrations: User ↔ Event registrations

#### Supporting Tables
- FamilyMembers: Family membership details
- MembershipPayments: Payment history and validity
- ActivityLog: User activity tracking

### Views
- `vw_UserDashboard`: Aggregated user statistics
- `vw_ClubStatistics`: Club membership counts
- `vw_EventStatistics`: Event registration stats

## Setup Instructions

### 1. Database Setup

```sql
-- Connect to SQL Server
sqlcmd -S localhost -U sa -P YourPassword

-- Run the schema creation script
:r Database/CreateTables.sql
GO
```

Or using SQL Server Management Studio (SSMS):
1. Open SSMS and connect to your SQL Server instance
2. Open `Database/CreateTables.sql`
3. Execute the script

This will:
- Create the `CasecDB` database
- Create all tables with relationships
- Insert default membership types (Individual, Family, Director)
- Insert sample clubs (6 clubs)
- Insert sample events (4 events)
- Create views and stored procedures
- Set up indexes for performance

### 2. API Configuration

Update `CasecApi/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CasecDB;User Id=sa;Password=YourPassword;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "YourSecretKeyForJWTTokenGenerationMustBe32CharsOrLonger!",
    "Issuer": "CasecApi",
    "Audience": "CasecApp"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 3. Build and Run API

```bash
# Navigate to API directory
cd CasecApi

# Restore dependencies
dotnet restore

# Build project
dotnet build

# Run migrations (if needed)
dotnet ef database update

# Run the API
dotnet run
```

The API will be available at: `https://localhost:5001` (HTTPS) or `http://localhost:5000` (HTTP)

API Documentation (Swagger): `https://localhost:5001/swagger`

### 4. Frontend Setup

The frontend is a single-page application that needs to be served through a web server.

#### Option 1: Using API's static files
Place `index.html` in `CasecApi/wwwroot/` and access via the API server.

#### Option 2: Separate web server
Use any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080

# Using .NET
dotnet serve -p 8080
```

#### Option 3: Development Server
Open `index.html` directly in a browser (update API endpoints to match your API URL).

### 5. Update Frontend API Endpoint

Edit the frontend JavaScript to point to your API:

```javascript
// At the top of the script section
const API_BASE_URL = 'https://localhost:5001/api';
```

## API Endpoints

### Authentication
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login user
```

### Membership Types (Admin)
```
GET    /api/membershiptypes           Get all membership types
GET    /api/membershiptypes/{id}      Get specific type
POST   /api/membershiptypes           Create new type (Admin)
PUT    /api/membershiptypes/{id}      Update type (Admin)
DELETE /api/membershiptypes/{id}      Delete type (Admin)
```

### Clubs
```
GET    /api/clubs                Get all clubs
GET    /api/clubs/{id}           Get specific club
POST   /api/clubs                Create club (Admin)
PUT    /api/clubs/{id}           Update club (Admin)
DELETE /api/clubs/{id}           Delete club (Admin)
POST   /api/clubs/{id}/join      Join club
POST   /api/clubs/{id}/leave     Leave club
GET    /api/clubs/my-clubs       Get user's clubs
```

### Events
```
GET    /api/events                    Get all events
GET    /api/events/{id}               Get specific event
POST   /api/events                    Create event (Admin/Director)
PUT    /api/events/{id}               Update event (Admin/Director)
DELETE /api/events/{id}               Delete event (Admin/Director)
POST   /api/events/{id}/register      Register for event
POST   /api/events/{id}/unregister    Unregister from event
GET    /api/events/my-events          Get user's events
```

### Users
```
GET    /api/users/profile         Get current user profile
PUT    /api/users/profile         Update profile
GET    /api/users/dashboard       Get dashboard data
```

### Payments
```
POST   /api/payments/process      Process membership payment
GET    /api/payments/history      Get payment history
```

## Admin Features

### Creating a New Membership Type

```bash
# Example: Creating a "Student" membership type
curl -X POST https://localhost:5001/api/membershiptypes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "name": "Student",
    "description": "Special rate for students with valid ID",
    "annualFee": 25.00,
    "maxFamilyMembers": 1,
    "canManageClubs": false,
    "canManageEvents": false,
    "hasBoardVotingRights": false,
    "displayOrder": 4,
    "icon": "🎓"
  }'
```

### Creating a New Club

```bash
curl -X POST https://localhost:5001/api/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "name": "Photography Club",
    "description": "Capture moments and improve photography skills together",
    "icon": "📸",
    "meetingFrequency": "Bi-weekly",
    "meetingDay": "Saturday",
    "meetingTime": "14:00:00",
    "location": "Community Center",
    "maxMembers": 30
  }'
```

### Deactivating a Membership Type

```bash
curl -X PUT https://localhost:5001/api/membershiptypes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "isActive": false
  }'
```

## Security

### JWT Authentication
- Tokens expire after 7 days
- Include in requests: `Authorization: Bearer {token}`
- Tokens contain: UserId, Email, Name, Role, MembershipTypeId

### Password Security
- Passwords hashed using BCrypt
- Minimum 8 characters required
- Salt automatically generated

### Role-Based Authorization
- **User Role**: Standard member access
- **Admin Role**: Full system management
  - Manage membership types
  - Manage all clubs
  - Manage all events
  - View all users

### API Security Best Practices
- HTTPS enforced in production
- CORS configured for specific origins
- SQL injection protected via EF Core parameterization
- Input validation on all endpoints

## Data Flow Examples

### User Registration Flow
1. User fills registration form with membership type selection
2. Frontend sends POST to `/api/auth/register`
3. Backend validates data and membership type
4. Password hashed with BCrypt
5. User record created in database
6. Family members added if applicable
7. Activity logged
8. JWT token generated and returned
9. Frontend stores token and redirects to dashboard

### Club Join Flow
1. User clicks "Join Club" button
2. Frontend sends POST to `/api/clubs/{id}/join` with JWT token
3. Backend verifies user authentication
4. Checks if club is active and has capacity
5. Creates ClubMembership record
6. Logs activity
7. Returns success response
8. Frontend updates UI to show "Joined" status

### Payment Processing Flow
1. User selects membership renewal
2. Form displays current membership type and fee
3. User enters payment details
4. Frontend sends POST to `/api/payments/process`
5. Backend validates membership type and amount
6. Creates MembershipPayment record
7. Sets validity dates (1 year from today)
8. Returns payment confirmation
9. Frontend shows success and updated expiry date

## Customization

### Adding Custom Fields

To add a custom field to users:

1. Update database:
```sql
ALTER TABLE Users ADD LinkedIn NVARCHAR(255);
```

2. Update Entity Model (`Models/Entities.cs`):
```csharp
public string? LinkedIn { get; set; }
```

3. Update DTOs if needed (`Models/DTOs.cs`)

4. Run migration:
```bash
dotnet ef migrations add AddLinkedInField
dotnet ef database update
```

### Changing Membership Rules

Edit the MembershipTypes table directly or via the API to adjust:
- Annual fees
- Family member limits
- Permission levels
- Display order

Changes take effect immediately for new operations.

## Testing

### Creating an Admin User

Run this SQL after creating a regular user:

```sql
UPDATE Users 
SET IsAdmin = 1 
WHERE Email = 'admin@casec.org';
```

### Sample Test Data

The database script includes:
- 3 default membership types
- 6 sample clubs
- 4 sample events

Create test users with different membership types to test all features.

### Testing Checklist

- [ ] User registration with each membership type
- [ ] Login with valid/invalid credentials
- [ ] Profile updates
- [ ] Joining clubs (check capacity limits)
- [ ] Leaving clubs
- [ ] Event registration (check capacity)
- [ ] Event unregistration
- [ ] Payment processing
- [ ] Admin: Create membership type
- [ ] Admin: Update membership type
- [ ] Admin: Deactivate membership type
- [ ] Admin: Create club
- [ ] Admin: Update club
- [ ] Admin: Delete club
- [ ] Admin: Create event
- [ ] Admin: Update event
- [ ] Admin: Delete event

## Troubleshooting

### Database Connection Issues
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure SQL Server accepts connections (TCP/IP enabled)
- Verify firewall rules allow connection

### JWT Token Issues
- Check token expiration (7 days default)
- Verify JWT secret key matches in configuration
- Ensure Authorization header format: `Bearer {token}`

### CORS Errors
- Update CORS policy in `Program.cs`
- Ensure frontend origin is allowed
- Check preflight requests are handled

### EF Core Migration Issues
```bash
# Reset database
dotnet ef database drop
dotnet ef database update

# Or manually run CreateTables.sql script
```

## Production Deployment

### Environment Configuration

1. **Database**: Use Azure SQL or SQL Server instance
2. **API**: Deploy to Azure App Service, AWS, or IIS
3. **Frontend**: Deploy to Azure Static Web Apps, Netlify, or CDN

### Security Checklist
- [ ] Use strong JWT secret key (64+ characters)
- [ ] Enable HTTPS only
- [ ] Configure CORS for specific origins
- [ ] Use secure connection strings (Azure Key Vault)
- [ ] Enable rate limiting
- [ ] Implement request validation
- [ ] Add logging and monitoring
- [ ] Regular security audits
- [ ] Backup database regularly

### Performance Optimization
- [ ] Enable response caching
- [ ] Use database indexes (already included)
- [ ] Implement pagination for large lists
- [ ] Optimize query projections
- [ ] Use connection pooling
- [ ] Enable gzip compression

## License

MIT License - Free to use and modify for your organization.

## Support

For issues or questions:
1. Check this README
2. Review API documentation (Swagger)
3. Check database schema documentation
4. Review code comments

## Future Enhancements

Potential features to add:
- Email notifications for events
- SMS reminders
- Photo galleries for clubs
- Document sharing
- Member directory search
- Advanced reporting and analytics
- Mobile app (React Native)
- Social features (member posts, forums)
- Event check-in system
- Membership renewal reminders
- Integration with payment processors (Stripe, PayPal)
- Multi-language support
- Advanced admin dashboard with charts

## Contributing

To contribute to this project:
1. Follow the code structure and naming conventions
2. Add XML documentation to public methods
3. Write unit tests for new features
4. Update this README for major changes
5. Follow RESTful API design principles

---

**Built with ❤️ for CASEC Community**
