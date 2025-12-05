# CASEC Quick Start Guide

## What You Have

A complete full-stack membership management system with:

1. **SQL Server Database** - Complete schema with tables, relationships, views, and sample data
2. **.NET Core 8 Web API** - RESTful API with JWT authentication
3. **Frontend HTML App** - Modern single-page application (from previous deliverable)

## Quick Setup (5 Steps)

### Step 1: Database Setup (5 minutes)

```bash
# Option A: Using sqlcmd
sqlcmd -S localhost -U sa -P YourPassword
> :r Database/CreateTables.sql
> GO
> EXIT

# Option B: Using SQL Server Management Studio
# 1. Open SSMS
# 2. Connect to your SQL Server
# 3. File → Open → Database/CreateTables.sql
# 4. Execute (F5)
```

**What this creates:**
- Database: `CasecDB`
- 10 tables with relationships
- 3 default membership types (Individual $50, Family $120, Director $200)
- 6 sample clubs (Book Club, Tennis, Art, Culinary, Tech, Gardening)
- 4 sample events
- Views and indexes

### Step 2: Update Connection String (1 minute)

Edit `CasecApi/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=CasecDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=true;"
}
```

Common server names:
- Local: `localhost` or `(localdb)\\mssqllocaldb`
- Express: `.\\SQLEXPRESS`
- Azure: `yourserver.database.windows.net`

### Step 3: Run the API (2 minutes)

```bash
cd CasecApi
dotnet restore
dotnet build
dotnet run
```

API will start at: `https://localhost:5001`

Test it: Open browser to `https://localhost:5001/swagger`

### Step 4: Setup Frontend (1 minute)

Use the frontend HTML file from the previous deliverable, or create a simple test:

Update the API URL in the JavaScript:
```javascript
const API_BASE_URL = 'https://localhost:5001/api';
```

### Step 5: Create Admin User (1 minute)

First, register a user through the API or frontend, then run:

```sql
USE CasecDB;
UPDATE Users SET IsAdmin = 1 WHERE Email = 'your-email@example.com';
```

## Testing Your Setup

### 1. Test Database
```sql
USE CasecDB;
SELECT * FROM MembershipTypes;  -- Should return 3 types
SELECT * FROM Clubs;            -- Should return 6 clubs
SELECT * FROM Events;           -- Should return 4 events
```

### 2. Test API

Using curl or Postman:

```bash
# Get membership types
curl https://localhost:5001/api/membershiptypes

# Register a user
curl -X POST https://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phoneNumber": "555-1234",
    "membershipTypeId": 1
  }'

# Login
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### 3. Test Frontend
1. Open the HTML file in a browser
2. Register a new user
3. Login
4. Browse clubs and events
5. Join a club
6. Register for an event

## Key Features to Test

### As Regular User:
- ✅ Register with different membership types
- ✅ Login and view dashboard
- ✅ Update profile (profession, hobbies, bio)
- ✅ Browse and join clubs
- ✅ Register for events
- ✅ View payment history

### As Admin:
- ✅ Create new membership type
- ✅ Update membership type prices
- ✅ Create new clubs
- ✅ Update club details
- ✅ Create events
- ✅ Deactivate clubs/events

## Common Issues & Solutions

### Issue: Can't connect to database
**Solution:**
- Check SQL Server is running: `services.msc` (Windows) or `systemctl status mssql-server` (Linux)
- Verify connection string
- Check firewall allows SQL Server port (1433)

### Issue: JWT authentication fails
**Solution:**
- Make sure you include the token in requests: `Authorization: Bearer YOUR_TOKEN`
- Check token hasn't expired (7 days default)
- Verify Jwt:Key in appsettings.json

### Issue: CORS errors in browser
**Solution:**
- API already configured for CORS
- Check you're using correct API URL in frontend
- Try running API and frontend on same domain

### Issue: 404 Not Found
**Solution:**
- Verify API is running
- Check URL endpoints match (case-sensitive)
- Review Swagger documentation for correct routes

## Project Structure

```
casec-app/
├── README.md                          # Full documentation
├── QUICKSTART.md                      # This file
├── Database/
│   └── CreateTables.sql              # Run this first!
├── CasecApi/                         # .NET Core API
│   ├── Controllers/                  # API endpoints
│   ├── Models/                       # Database & DTO models
│   ├── Data/                         # EF Core context
│   ├── Program.cs                    # App configuration
│   ├── appsettings.json             # Settings (UPDATE THIS!)
│   └── CasecApi.csproj              # Dependencies
└── Frontend/
    └── index.html                    # Web application
```

## Admin Management Examples

### Create New Membership Type

```bash
curl -X POST https://localhost:5001/api/membershiptypes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Student",
    "description": "Discounted rate for students",
    "annualFee": 25.00,
    "maxFamilyMembers": 1,
    "icon": "🎓",
    "displayOrder": 4
  }'
```

### Create New Club

```bash
curl -X POST https://localhost:5001/api/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Photography Club",
    "description": "Learn and share photography techniques",
    "icon": "📸",
    "meetingFrequency": "Weekly",
    "maxMembers": 25
  }'
```

### Update Membership Price

```bash
curl -X PUT https://localhost:5001/api/membershiptypes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "annualFee": 60.00
  }'
```

## Data-Driven Configuration

Everything is configurable via the database or API:

| What | How to Change |
|------|--------------|
| Membership Types | Admin panel or API |
| Membership Prices | Update via API |
| Clubs | Admin panel or API |
| Events | Admin panel or API |
| User Permissions | Update MembershipType permissions |
| Max Family Members | Update MembershipType.MaxFamilyMembers |

## API Documentation

Once running, visit: `https://localhost:5001/swagger`

This interactive documentation allows you to:
- View all endpoints
- See request/response schemas
- Test API calls directly
- Authenticate with JWT token

## Default Data

### Membership Types:
1. **Individual** - $50/year - 1 member
2. **Family** - $120/year - Up to 4 members
3. **Director** - $200/year - 4 members + admin rights

### Clubs:
1. Book Club 📚
2. Tennis Enthusiasts 🎾
3. Art & Culture 🎨
4. Culinary Circle 🍳
5. Tech & Innovation 💻
6. Green Thumb Society 🌱

### Events:
1. Annual Gala Dinner - Dec 15 - $75
2. New Year Networking Mixer - Jan 5 - $25
3. Family Picnic Day - Jan 20 - Free
4. Professional Development Workshop - Feb 10 - $50

## Next Steps

1. ✅ Setup database
2. ✅ Run API
3. ✅ Test with Swagger
4. ✅ Create admin user
5. ✅ Setup frontend
6. 📝 Customize membership types for your needs
7. 📝 Add your clubs
8. 📝 Create your events
9. 📝 Customize branding and colors
10. 🚀 Deploy to production

## Production Checklist

Before going live:
- [ ] Change JWT secret key to strong random value
- [ ] Update connection string to production database
- [ ] Enable HTTPS only
- [ ] Update CORS to specific origins
- [ ] Set up SSL certificate
- [ ] Configure logging
- [ ] Set up database backups
- [ ] Add rate limiting
- [ ] Review security settings
- [ ] Test all features thoroughly

## Getting Help

1. Check the full README.md for detailed documentation
2. Review Swagger docs at /swagger
3. Check SQL Server logs for database issues
4. Review API logs (console output)
5. Use browser developer tools for frontend issues

## Key Files to Review

- `Database/CreateTables.sql` - Database schema
- `CasecApi/Program.cs` - API startup configuration
- `CasecApi/appsettings.json` - Configuration settings
- `Controllers/AuthController.cs` - User registration/login
- `Controllers/MembershipTypesController.cs` - Admin management

---

**You're ready to go!** 🎉

The system is fully functional with sample data. Start by:
1. Running the database script
2. Starting the API
3. Creating an admin user
4. Exploring the Swagger documentation
