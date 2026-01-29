-- Migration: Add OgTitle and OgDescription columns to EventPrograms
-- These fields provide dedicated Open Graph title/description overrides
-- for social sharing previews, separate from the page display title/description.

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'EventPrograms' AND COLUMN_NAME = 'OgTitle'
)
BEGIN
    ALTER TABLE EventPrograms ADD OgTitle NVARCHAR(200) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'EventPrograms' AND COLUMN_NAME = 'OgDescription'
)
BEGIN
    ALTER TABLE EventPrograms ADD OgDescription NVARCHAR(500) NULL;
END
GO
