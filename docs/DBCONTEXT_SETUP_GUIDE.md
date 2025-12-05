# DbContext Setup Guide

## Issue
The `CasecDbContext` needs to include all new entities (ClubAdmins, FamilyGroups, ThemeSettings, etc.)

## Solution
Updated `CasecDbContext.cs` with all entity DbSets and relationships.

---

## Complete DbContext Entities

### Core Entities (4)
```csharp
public DbSet<User> Users { get; set; }
public DbSet<MembershipType> MembershipTypes { get; set; }
public DbSet<MembershipPayment> MembershipPayments { get; set; }
public DbSet<ActivityLog> ActivityLogs { get; set; }
```

### Club Entities (3)
```csharp
public DbSet<Club> Clubs { get; set; }
public DbSet<ClubMembership> ClubMemberships { get; set; }
public DbSet<ClubAdmin> ClubAdmins { get; set; }  // NEW!
```

### Event Entities (2)
```csharp
public DbSet<Event> Events { get; set; }
public DbSet<EventRegistration> EventRegistrations { get; set; }
```

### Family Entities (1)
```csharp
public DbSet<FamilyGroup> FamilyGroups { get; set; }  // NEW!
```

### Theme Entities (2)
```csharp
public DbSet<ThemeSettings> ThemeSettings { get; set; }  // NEW!
public DbSet<ThemePreset> ThemePresets { get; set; }     // NEW!
```

**Total: 12 DbSets**

---

## Entity Relationships

### User Relationships
- **MembershipType**: Many-to-One (Restrict delete)
- **FamilyGroup**: Many-to-One (Set null on delete)

### Club Relationships
- **ClubMemberships**: One-to-Many (Cascade delete)
- **ClubAdmins**: One-to-Many (Cascade delete)
- **HostedEvents**: One-to-Many (Set null on delete)

### ClubAdmin Relationships
- **Club**: Many-to-One (Cascade delete)
- **User**: Many-to-One (Cascade delete)
- **AssignedByUser**: Many-to-One (Restrict delete)

### Event Relationships
- **HostClub**: Many-to-One (Set null on delete)
- **EventRegistrations**: One-to-Many (Cascade delete)

### FamilyGroup Relationships
- **PrimaryUser**: Many-to-One (Restrict delete)
- **Members**: One-to-Many (Set null on delete)

### ThemeSettings Relationships
- **UpdatedByUser**: Many-to-One (Set null on delete)

---

## Unique Indexes

1. **User.Email** - Unique (email uniqueness)
2. **ClubMembership** - Unique on (ClubId, UserId)
3. **ClubAdmin** - Unique on (ClubId, UserId)
4. **EventRegistration** - Unique on (EventId, UserId)

---

## File Location

Replace your existing DbContext:
```
CasecApi/Data/CasecDbContext.cs
```

---

## Verification

After updating, verify all entities are accessible:

```csharp
// These should all work without errors:
var users = await _context.Users.ToListAsync();
var clubs = await _context.Clubs.ToListAsync();
var clubAdmins = await _context.ClubAdmins.ToListAsync();
var families = await _context.FamilyGroups.ToListAsync();
var theme = await _context.ThemeSettings.FirstOrDefaultAsync();
var presets = await _context.ThemePresets.ToListAsync();
```

---

## Common Errors & Fixes

### Error 1: "ClubAdmins not found"
**Cause**: DbContext missing ClubAdmin DbSet  
**Fix**: Use updated CasecDbContext.cs

### Error 2: "FamilyGroups not found"
**Cause**: DbContext missing FamilyGroup DbSet  
**Fix**: Use updated CasecDbContext.cs

### Error 3: "ThemeSettings not found"
**Cause**: DbContext missing ThemeSettings DbSet  
**Fix**: Use updated CasecDbContext.cs

### Error 4: Navigation property errors
**Cause**: Entity relationships not configured  
**Fix**: Check OnModelCreating() has all relationships

---

## What's Configured

### ✅ All 12 entity DbSets
### ✅ Primary keys
### ✅ Required fields
### ✅ String max lengths
### ✅ Decimal precision
### ✅ Foreign key relationships
### ✅ Delete behaviors
### ✅ Unique indexes
### ✅ Navigation properties

---

## No Migration Needed

The DbContext is Code-First configuration ONLY. All tables already exist from SQL migrations. The DbContext just maps to them.

**Already have tables?** ✅ Just use new DbContext  
**Starting fresh?** Run all 5 SQL migrations first

---

## Build & Run

```bash
cd CasecApi
dotnet restore
dotnet build
dotnet run
```

Should compile without errors!
