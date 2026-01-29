-- ============================================================================
-- CASEC Performer Bilingual Bio Migration
-- Adds BioZh and BioEn columns to Performers table
-- Allows performers to have separate Chinese and English biographies
-- ============================================================================

-- Add BioZh column to Performers table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Performers]') AND name = 'BioZh')
BEGIN
    ALTER TABLE [dbo].[Performers]
    ADD [BioZh] NVARCHAR(MAX) NULL;

    PRINT 'Added BioZh column to Performers table';
END
GO

-- Add BioEn column to Performers table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Performers]') AND name = 'BioEn')
BEGIN
    ALTER TABLE [dbo].[Performers]
    ADD [BioEn] NVARCHAR(MAX) NULL;

    PRINT 'Added BioEn column to Performers table';
END
GO

-- Optional: Migrate existing Bio data to BioZh (assuming most existing data is Chinese)
-- Uncomment the following if you want to copy existing Bio to BioZh
/*
UPDATE [dbo].[Performers]
SET [BioZh] = [Bio]
WHERE [Bio] IS NOT NULL AND [BioZh] IS NULL;

PRINT 'Migrated existing Bio data to BioZh';
*/
GO

PRINT 'Migration complete: Performers table now has BioZh and BioEn columns';
