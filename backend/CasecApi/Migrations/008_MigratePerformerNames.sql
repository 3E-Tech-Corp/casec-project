-- Migration: Migrate Existing Performer Names to Performers Table
-- Date: 2026-01-27
-- Description: Extracts unique performer names from ProgramItems.PerformerNames and PerformerNames2
--              and inserts them into the Performers table
-- Compatibility: SQL Server 2014+

-- First, insert unique names from PerformerNames column (that don't already exist)
INSERT INTO [Performers] ([Name], [IsActive], [CreatedAt], [UpdatedAt])
SELECT DISTINCT LTRIM(RTRIM(pi.[PerformerNames])), 1, GETUTCDATE(), GETUTCDATE()
FROM [ProgramItems] pi
WHERE pi.[PerformerNames] IS NOT NULL
  AND LTRIM(RTRIM(pi.[PerformerNames])) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM [Performers] p
    WHERE p.[Name] = LTRIM(RTRIM(pi.[PerformerNames]))
       OR p.[ChineseName] = LTRIM(RTRIM(pi.[PerformerNames]))
       OR p.[EnglishName] = LTRIM(RTRIM(pi.[PerformerNames]))
  );

-- Now insert unique names from PerformerNames2 column (that don't already exist)
INSERT INTO [Performers] ([Name], [IsActive], [CreatedAt], [UpdatedAt])
SELECT DISTINCT LTRIM(RTRIM(pi.[PerformerNames2])), 1, GETUTCDATE(), GETUTCDATE()
FROM [ProgramItems] pi
WHERE pi.[PerformerNames2] IS NOT NULL
  AND LTRIM(RTRIM(pi.[PerformerNames2])) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM [Performers] p
    WHERE p.[Name] = LTRIM(RTRIM(pi.[PerformerNames2]))
       OR p.[ChineseName] = LTRIM(RTRIM(pi.[PerformerNames2]))
       OR p.[EnglishName] = LTRIM(RTRIM(pi.[PerformerNames2]))
  );

-- Report how many performers were created
DECLARE @count INT;
SELECT @count = COUNT(*) FROM [Performers];
PRINT 'Total performers in table: ' + CAST(@count AS NVARCHAR(10));

-- Show the migrated performers
SELECT [PerformerId], [Name], [IsActive], [CreatedAt]
FROM [Performers]
ORDER BY [Name];

PRINT 'Performer names migration completed successfully';
