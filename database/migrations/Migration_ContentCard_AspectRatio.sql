-- ============================================================================
-- CASEC ContentCard AspectRatio Migration
-- Adds AspectRatio column to ContentCards table
-- Allows media (images and videos) to display at specified aspect ratios
-- Options: "original", "16:9", "4:3", "1:1", "3:2"
-- ============================================================================

-- Add AspectRatio column to ContentCards table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ContentCards]') AND name = 'AspectRatio')
BEGIN
    ALTER TABLE [dbo].[ContentCards]
    ADD [AspectRatio] NVARCHAR(20) NULL DEFAULT 'original';

    PRINT 'Added AspectRatio column to ContentCards table';
END
GO

-- Set default value for existing records
UPDATE [dbo].[ContentCards]
SET [AspectRatio] = 'original'
WHERE [AspectRatio] IS NULL;

PRINT 'Set default AspectRatio to "original" for existing records';
GO

PRINT 'Migration complete: ContentCards table now has AspectRatio column';
