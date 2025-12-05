# Board Members & Avatar Implementation Guide

## Overview

This guide covers three major features:
1. **Avatar Upload** - Members can upload profile photos
2. **Admin User Management** - Admins can edit users and assign board roles
3. **Public Board Page** - Showcase board of directors publicly

## Database Migration

### Step 1: Run Migration SQL

Execute the migration to add new fields to the Users table:

```bash
sqlcmd -S localhost -U sa -P YourPassword -i Database/AddBoardMembersAndAvatar.sql
```

This adds:
- `AvatarUrl` - Stores uploaded avatar path
- `IsBoardMember` - Boolean flag for board members
- `BoardTitle` - e.g., "President", "Treasurer"
- `BoardDisplayOrder` - Integer for ordering (1, 2, 3...)
- `BoardBio` - Special bio for public display
- `LinkedInUrl` - Social media link
- `TwitterHandle` - Social media link

## Backend Setup

### Step 2: Update Entity Model

The enhanced User entity (in `EnhancedEntities.cs`) includes all new fields. Update your `Entities.cs` to match, or replace it with the enhanced version.

### Step 3: Add Controllers

Copy the new controllers to your project:

```bash
# Replace the existing UsersController
cp EnhancedUsersController.cs Controllers/UsersController.cs

# Copy the PaymentsController if you haven't already
cp PaymentsController.cs Controllers/
```

### Step 4: Update DTOs

The new DTOs in `DTOs.cs` include:
- `UserDto` - Basic user info with board fields
- `UserProfileDto` - Full profile with avatar
- `AdminEditUserRequest` - For admin user editing
- `BoardMemberDto` - For public board display
- `PublicProfileDto` - For individual profile pages
- `AvatarResponse` - Avatar upload response

### Step 5: Configure Static Files

Update `Program.cs` to serve uploaded files:

```csharp
// Add this before app.UseRouting()
app.UseStaticFiles(); // Enable serving static files from wwwroot

// Create uploads directory on startup
var uploadsPath = Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "uploads", "avatars");
Directory.CreateDirectory(uploadsPath);
```

### Step 6: Update CORS (if needed)

Ensure CORS allows file uploads:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader()
               .WithExposedHeaders("Content-Disposition"); // For file downloads
    });
});
```

## Frontend Setup

### Step 7: Add New Pages and Routes

Update `App.jsx` to include new routes:

```jsx
import EnhancedProfile from './pages/EnhancedProfile';
import ManageUsers from './pages/admin/ManageUsers';
import BoardOfDirectors from './pages/BoardOfDirectors';
import PublicProfile from './pages/PublicProfile';

// Inside protected routes
<Route path="profile" element={<EnhancedProfile />} />

// Inside admin routes
<Route path="admin/users" element={
  <AdminRoute><ManageUsers /></AdminRoute>
} />

// Public routes (outside protected Route)
<Route path="/board" element={<BoardOfDirectors />} />
<Route path="/board-profile/:userId" element={<PublicProfile />} />
```

### Step 8: Update Navigation

Add links to new pages in `Layout.jsx`:

```jsx
const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/clubs', label: 'Clubs' },
  { path: '/events', label: 'Events' },
  { path: '/board', label: 'Board' }, // ADD THIS - public page
  { path: '/profile', label: 'Profile' },
];

const adminLinks = user?.isAdmin ? [
  { path: '/admin/membership-types', label: 'Membership Types' },
  { path: '/admin/clubs', label: 'Manage Clubs' },
  { path: '/admin/events', label: 'Manage Events' },
  { path: '/admin/users', label: 'Manage Users' }, // ADD THIS
  { path: '/admin/payments', label: 'Record Payments' },
] : [];
```

### Step 9: Copy New Page Files

Copy the new frontend files:
- `src/pages/EnhancedProfile.jsx` - Avatar upload & profile editing
- `src/pages/admin/ManageUsers.jsx` - Admin user management
- `src/pages/BoardOfDirectors.jsx` - Public board showcase
- `src/pages/PublicProfile.jsx` - Individual board member profile

## Usage Workflows

### Workflow 1: Member Uploads Avatar

1. Member logs in → Goes to Profile
2. Clicks camera icon on avatar
3. Selects photo (JPG, PNG, GIF, WEBP, max 5MB)
4. Preview appears
5. Clicks "Upload New Avatar"
6. Avatar saved to `/uploads/avatars/`
7. URL stored in database
8. Avatar displays across the site

### Workflow 2: Admin Assigns Board Role

1. Admin logs in → Goes to "Manage Users"
2. Searches for member
3. Clicks "Edit"
4. In the modal:
   - Checks "Board Member"
   - Selects Board Title (e.g., "President")
   - Enters Display Order (e.g., 1)
   - Writes Board Bio
5. Saves
6. Member now appears on public Board page

### Workflow 3: Public Views Board

1. **Anyone** (no login required) visits `/board`
2. Sees grid of board members with:
   - Avatar photo
   - Name
   - Board title badge
   - Short bio
   - Social links
3. Clicks "View Full Profile"
4. Sees detailed profile page at `/board-profile/:userId`

## Features

### Avatar Upload
- **Formats**: JPG, JPEG, PNG, GIF, WEBP
- **Size Limit**: 5MB
- **Storage**: `/wwwroot/uploads/avatars/`
- **Naming**: `{userId}_{guid}.ext`
- **Old File**: Automatically deleted on new upload
- **Security**: File type and size validation

### Admin User Management
- Edit all user fields
- Assign/remove admin role
- Designate board members
- Set board titles and display order
- Write custom board bios
- Activate/deactivate accounts

### Board Page Features
- **Public Access**: No login required
- **Responsive Grid**: 3 columns on desktop
- **Sorted Display**: By DisplayOrder field
- **Hero Section**: Gradient header with mission
- **Member Cards**: Avatar, title, bio, social links
- **Profile Links**: Click to view full profile
- **CTA Section**: Encourage membership sign-ups

### Public Profile Features
- Full member information
- Board title badge (if applicable)
- Professional details
- Member since date
- LinkedIn/Twitter links
- Special board leadership section
- Back button navigation

## Board Titles

Predefined options (customizable):
- President
- Vice President
- Treasurer
- Secretary
- Board Member
- Director of Communications
- Director of Membership
- Director of Events
- Director of Operations

## Display Order Logic

Lower numbers appear first:
- 1 = President (appears first)
- 2 = Vice President
- 3 = Treasurer
- 4 = Secretary
- etc.

Members without display order appear last.

## Testing Checklist

### Avatar Upload
- [ ] Upload JPG, PNG, GIF, WEBP
- [ ] Reject invalid file types
- [ ] Reject files over 5MB
- [ ] Preview before upload
- [ ] Old avatar deleted on new upload
- [ ] Avatar displays in header
- [ ] Avatar displays on board page
- [ ] Avatar displays in user list

### Admin User Management
- [ ] Search users by name/email
- [ ] Edit basic information
- [ ] Change membership type
- [ ] Toggle admin role
- [ ] Toggle board member status
- [ ] Set board title from dropdown
- [ ] Set display order (numbers)
- [ ] Write board bio
- [ ] Activate/deactivate users
- [ ] Changes saved to database

### Board Page
- [ ] Accessible without login at `/board`
- [ ] All board members displayed
- [ ] Sorted by display order
- [ ] Avatars load correctly
- [ ] Board titles show in badges
- [ ] Bios truncated with line-clamp
- [ ] Social links open in new tab
- [ ] "View Profile" links work
- [ ] Responsive on mobile
- [ ] Empty state displays when no board members

### Public Profile
- [ ] Loads at `/board-profile/:userId`
- [ ] Displays avatar or initials
- [ ] Shows board title badge
- [ ] Shows profession
- [ ] Shows full bio
- [ ] Shows member since date
- [ ] LinkedIn link works
- [ ] Twitter link works
- [ ] Back button returns to board page
- [ ] 404 handling for invalid user

## Security Considerations

### Avatar Upload
- File type validation (whitelist)
- File size limits (5MB)
- Unique filenames prevent overwrites
- Stored outside document root option

### Admin Functions
- Role-based authorization (`[Authorize(Roles = "Admin")]`)
- Activity logging for all edits
- Audit trail in ActivityLog table

### Public Access
- Board page uses `[AllowAnonymous]`
- Only public-safe fields exposed
- No email addresses shown
- Bio is sanitized (use board-specific bio)

## Customization

### Change Board Titles

Edit in `ManageUsers.jsx`:
```jsx
const boardTitles = [
  'Your Custom Title 1',
  'Your Custom Title 2',
  // ...
];
```

### Change Avatar Size Limit

Update in `UsersController.cs`:
```csharp
// Change 5MB to your desired size
if (file.Length > 10 * 1024 * 1024) // 10MB example
```

### Change Avatar Dimensions

Add image processing library (e.g., SixLabors.ImageSharp):
```csharp
// Resize to 400x400
using var image = Image.Load(file.OpenReadStream());
image.Mutate(x => x.Resize(400, 400));
```

### Custom Board Page Styling

Update colors/layout in `BoardOfDirectors.jsx`:
- Hero gradient
- Card styling
- Grid columns (3 default)
- Avatar size (h-64 default)

## Production Deployment

### File Storage Options

**Option 1: Local File System** (Default)
- Files in `/wwwroot/uploads/avatars/`
- Simple but not scalable across servers
- Good for single-server deployments

**Option 2: Azure Blob Storage** (Recommended for production)
```csharp
// Install: Azure.Storage.Blobs
var blobClient = new BlobClient(connectionString, "avatars", fileName);
await blobClient.UploadAsync(file.OpenReadStream());
user.AvatarUrl = blobClient.Uri.ToString();
```

**Option 3: AWS S3**
```csharp
// Install: AWSSDK.S3
var s3Client = new AmazonS3Client();
await s3Client.PutObjectAsync(new PutObjectRequest {
    BucketName = "casec-avatars",
    Key = fileName,
    InputStream = file.OpenReadStream()
});
```

### CDN Integration

For better performance, serve avatars via CDN:
1. Upload to cloud storage
2. Configure CDN (CloudFlare, Azure CDN, CloudFront)
3. Update AvatarUrl to use CDN domain

### Image Optimization

Consider adding:
- Automatic image compression
- Multiple sizes (thumbnail, medium, full)
- WebP conversion for modern browsers
- Lazy loading on frontend

## API Endpoints Reference

### Users
```
GET    /api/users/profile              - Get current user profile
POST   /api/users/profile              - Update profile
POST   /api/users/avatar               - Upload avatar
GET    /api/users/all                  - [Admin] Get all users
PUT    /api/users/{id}/admin-edit      - [Admin] Edit user
GET    /api/users/board-members        - [Public] Get board members
GET    /api/users/{id}/public-profile  - [Public] Get profile
```

## Troubleshooting

### Avatar not uploading
- Check file size < 5MB
- Verify file extension allowed
- Check `/uploads/avatars/` directory exists
- Check write permissions on directory
- Verify CORS allows file uploads

### Board page showing 401 error
- Ensure endpoint has `[AllowAnonymous]`
- Check route is outside protected routes in App.jsx

### Avatars not displaying
- Check file path starts with `/`
- Verify `app.UseStaticFiles()` in Program.cs
- Check browser network tab for 404s
- Verify files exist in wwwroot/uploads/avatars

### Board members not sorted
- Check `BoardDisplayOrder` values set
- Verify ORDER BY clause in query
- Ensure index created on IsBoardMember, DisplayOrder

## Best Practices

1. **Avatar Management**
   - Delete old avatars to save space
   - Implement file size limits
   - Use cloud storage for production
   - Generate thumbnails

2. **Board Member Management**
   - Keep display order sequential (1, 2, 3...)
   - Write compelling bios (100-200 words)
   - Use professional photos
   - Update regularly

3. **Security**
   - Validate all file uploads
   - Sanitize user input
   - Use role-based access
   - Log all admin actions

4. **Performance**
   - Use CDN for avatars
   - Cache board member list
   - Optimize images
   - Lazy load on scroll

---

**You now have a complete board management system with avatars!** 🎉
