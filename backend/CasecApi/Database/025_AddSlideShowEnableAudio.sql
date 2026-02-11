-- Migration 025: Add EnableAudio column to SlideShows
-- Allows enabling audio for hero/background videos in slideshows

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SlideShows') AND name = 'EnableAudio')
BEGIN
    ALTER TABLE SlideShows ADD EnableAudio BIT NOT NULL DEFAULT 0;
    PRINT 'Added EnableAudio column to SlideShows';
END
ELSE
BEGIN
    PRINT 'EnableAudio column already exists';
END
GO
