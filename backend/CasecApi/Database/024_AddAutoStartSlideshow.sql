-- Migration 024: Add AutoStartSlideshow column to EventPrograms
-- Allows controlling whether slideshows auto-start when viewing a program

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('EventPrograms') AND name = 'AutoStartSlideshow')
BEGIN
    ALTER TABLE EventPrograms ADD AutoStartSlideshow BIT NOT NULL DEFAULT 0;
    PRINT 'Added AutoStartSlideshow column to EventPrograms';
END
ELSE
BEGIN
    PRINT 'AutoStartSlideshow column already exists';
END
GO
