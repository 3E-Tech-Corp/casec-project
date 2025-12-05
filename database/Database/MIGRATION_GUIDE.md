# Database Migration Guide - CASEC

## Problem
The database schema is out of sync with the entity models. Missing columns are causing runtime errors.

## Error Example
```
Invalid column name 'DurationMonths'.
Invalid column name 'Price'.
```

---

## Solution: Run Migration Script

### Step 1: Backup Current Database
```sql
BACKUP DATABASE CasecDb 
TO DISK = 'C:\Backups\CasecDb_Backup_BeforeMigration.bak'
WITH FORMAT;
```

### Step 2: Run Migration Script

**Option A: SQL Server Management Studio (SSMS)**
1. Open SSMS
2. Connect to your SQL Server instance
3. Open the file: `Database/Migration_AddMissingColumns.sql`
4. Execute the script (F5)

**Option B: Command Line (sqlcmd)**
```bash
sqlcmd -S localhost -d CasecDb -i Database/Migration_AddMissingColumns.sql
```

**Option C: Visual Studio**
1. Open SQL Server Object Explorer
2. Connect to your database
3. Right-click database → New Query
4. Paste contents of `Migration_AddMissingColumns.sql`
5. Execute

---

## What the Migration Does

### MembershipTypes Table - 10 New Columns
- `DurationMonths` (INT) - Membership duration
- `Price` (DECIMAL) - Base price
- `AnnualFee` (DECIMAL) - Annual fee amount
- `MaxFamilyMembers` (INT) - Max family size
- `CanManageClubs` (BIT) - Club management permission
- `CanManageEvents` (BIT) - Event management permission
- `HasBoardVotingRights` (BIT) - Board voting rights
- `DisplayOrder` (INT) - Display ordering
- `Icon` (NVARCHAR) - Icon identifier
- `UpdatedAt` (DATETIME2) - Last update timestamp

### Users Table - 9 New Columns
- `AvatarUrl` (NVARCHAR) - Profile picture URL
- `IsBoardMember` (BIT) - Board member flag
- `BoardTitle` (NVARCHAR) - Board position title
- `BoardDisplayOrder` (INT) - Board display order
- `BoardBio` (NVARCHAR) - Board member biography
- `LinkedInUrl` (NVARCHAR) - LinkedIn profile
- `TwitterHandle` (NVARCHAR) - Twitter handle
- `FamilyGroupId` (INT) - Family group reference
- `RelationshipToPrimary` (NVARCHAR) - Family relationship

### Clubs Table - 4 New Columns
- `AvatarUrl` (NVARCHAR) - Club logo/avatar
- `FoundedDate` (DATETIME2) - Founding date
- `MeetingSchedule` (NVARCHAR) - Meeting schedule description
- `ContactEmail` (NVARCHAR) - Contact email

### Events Table - 11 New Columns
- `EventType` (NVARCHAR) - Type: CasecEvent, ClubEvent, PartnerEvent
- `EventCategory` (NVARCHAR) - Event category
- `EventScope` (NVARCHAR) - Scope: AllMembers, ClubMembers, etc.
- `HostClubId` (INT) - Hosting club reference
- `PartnerName` (NVARCHAR) - Partner organization name
- `PartnerLogo` (NVARCHAR) - Partner logo URL
- `PartnerWebsite` (NVARCHAR) - Partner website
- `RegistrationUrl` (NVARCHAR) - External registration URL
- `MaxCapacity` (INT) - Maximum attendees
- `IsRegistrationRequired` (BIT) - Registration requirement
- `IsFeatured` (BIT) - Featured event flag

### ActivityLog Table - 1 New Column
- `IpAddress` (NVARCHAR) - User IP address

### Foreign Keys Added
- `FK_Users_FamilyGroups` - Users → FamilyGroups
- `FK_Events_Clubs_HostClubId` - Events → Clubs

---

## Verification

After running the migration, verify with:

```sql
-- Check MembershipTypes columns (should be 14)
SELECT COUNT(*) AS ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'MembershipTypes';

-- Check Users columns (should be 29)
SELECT COUNT(*) AS ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users';

-- Check Clubs columns (should be 8)
SELECT COUNT(*) AS ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Clubs';

-- Check Events columns (should be 20+)
SELECT COUNT(*) AS ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Events';

-- Check ActivityLog columns (should be 6)
SELECT COUNT(*) AS ColumnCount
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ActivityLog';
```

---

## Expected Column Counts

| Table | Before | After | New Columns |
|-------|--------|-------|-------------|
| MembershipTypes | 4 | 14 | +10 |
| Users | 20 | 29 | +9 |
| Clubs | 4 | 8 | +4 |
| Events | 10 | 21 | +11 |
| ActivityLog | 5 | 6 | +1 |

**Total New Columns: 35**

---

## Safety Features

The migration script includes:
- ✅ Idempotent checks (IF NOT EXISTS) - safe to run multiple times
- ✅ Default values for NOT NULL columns - no data loss
- ✅ NULL allowed where appropriate - backward compatible
- ✅ Transaction safety - all or nothing
- ✅ Verification queries - confirm success

---

## Rollback (If Needed)

If you need to rollback:

```sql
-- Restore from backup
RESTORE DATABASE CasecDb 
FROM DISK = 'C:\Backups\CasecDb_Backup_BeforeMigration.bak'
WITH REPLACE;
```

---

## Alternative: Recreate Database

If you prefer a clean slate and don't need existing data:

```sql
-- Drop existing database
DROP DATABASE IF EXISTS CasecDb;
GO

-- Create fresh database
CREATE DATABASE CasecDb;
GO

USE CasecDb;
GO

-- Then run the complete schema creation script
-- See: Database/CreateDatabase.sql
```

---

## After Migration

Once migration is complete:

1. **Restart your API**
   ```bash
   # Stop and start the API application
   ```

2. **Test Registration**
   ```bash
   # Try registering a new user
   POST /api/auth/register
   ```

3. **Verify Entities Load**
   ```bash
   # Check that entities load without errors
   GET /api/users
   GET /api/clubs
   GET /api/events
   ```

---

## Troubleshooting

### Error: "Cannot find table"
- Run the complete database creation script first
- See: `Database/CreateDatabase.sql`

### Error: "Column already exists"
- Safe to ignore - script is idempotent
- Column will not be added twice

### Error: "Foreign key constraint failed"
- Check that referenced tables exist
- Ensure FamilyGroups table exists before adding FK

---

## Files

- **Migration Script:** `Database/Migration_AddMissingColumns.sql`
- **Complete Schema:** `Database/CreateDatabase.sql`
- **This Guide:** `Database/MIGRATION_GUIDE.md`

---

## Status Checklist

After migration:
- [ ] Backup created
- [ ] Migration script executed
- [ ] No errors in SQL output
- [ ] Verification queries pass
- [ ] API restarts successfully
- [ ] Registration works
- [ ] Login works
- [ ] Data loads without errors

---

**Date:** December 4, 2025  
**Columns Added:** 35  
**Tables Modified:** 5  
**Status:** Ready to Execute
