-- Migration: Add AssetFileTypes table for DB-driven file type governance
-- Date: 2025-01-27
-- Purpose: Centralize allowed file types with per-type size limits, categories, and enable/disable control

-- =====================================================
-- 1. Create AssetFileTypes table
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AssetFileTypes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AssetFileTypes] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [MimeType] NVARCHAR(100) NOT NULL,
        [Extensions] NVARCHAR(255) NOT NULL,       -- comma-separated, e.g. ".jpg,.jpeg"
        [Category] NVARCHAR(50) NOT NULL,           -- Image, Video, Document, Audio
        [MaxSizeMB] INT NOT NULL DEFAULT 20,
        [IsEnabled] BIT NOT NULL DEFAULT 1,
        [DisplayName] NVARCHAR(100) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NULL,
        CONSTRAINT [PK_AssetFileTypes] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_AssetFileTypes_Category] ON [dbo].[AssetFileTypes] ([Category]);
    CREATE NONCLUSTERED INDEX [IX_AssetFileTypes_IsEnabled] ON [dbo].[AssetFileTypes] ([IsEnabled]);
    CREATE UNIQUE NONCLUSTERED INDEX [IX_AssetFileTypes_MimeType] ON [dbo].[AssetFileTypes] ([MimeType]);

    PRINT 'AssetFileTypes table created successfully.';
END
ELSE
BEGIN
    PRINT 'AssetFileTypes table already exists.';
END
GO

-- =====================================================
-- 2. Stored Procedures
-- =====================================================

-- GetEnabled: Returns only enabled file types
IF OBJECT_ID('dbo.csp_AssetFileTypes_GetEnabled', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_GetEnabled;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_GetEnabled
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    WHERE IsEnabled = 1
    ORDER BY Category, DisplayName;
END
GO

-- GetAll: Returns all file types including disabled
IF OBJECT_ID('dbo.csp_AssetFileTypes_GetAll', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_GetAll;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    ORDER BY Category, DisplayName;
END
GO

-- GetById
IF OBJECT_ID('dbo.csp_AssetFileTypes_GetById', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_GetById;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    WHERE Id = @Id;
END
GO

-- GetByCategory
IF OBJECT_ID('dbo.csp_AssetFileTypes_GetByCategory', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_GetByCategory;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_GetByCategory
    @Category NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    WHERE Category = @Category
    ORDER BY DisplayName;
END
GO

-- Create
IF OBJECT_ID('dbo.csp_AssetFileTypes_Create', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_Create;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_Create
    @MimeType NVARCHAR(100),
    @Extensions NVARCHAR(255),
    @Category NVARCHAR(50),
    @MaxSizeMB INT = 20,
    @IsEnabled BIT = 1,
    @DisplayName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AssetFileTypes (MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt)
    VALUES (@MimeType, @Extensions, @Category, @MaxSizeMB, @IsEnabled, @DisplayName, GETUTCDATE());

    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    WHERE Id = SCOPE_IDENTITY();
END
GO

-- Update
IF OBJECT_ID('dbo.csp_AssetFileTypes_Update', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_Update;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_Update
    @Id INT,
    @MimeType NVARCHAR(100),
    @Extensions NVARCHAR(255),
    @Category NVARCHAR(50),
    @MaxSizeMB INT,
    @IsEnabled BIT,
    @DisplayName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.AssetFileTypes
    SET MimeType = @MimeType,
        Extensions = @Extensions,
        Category = @Category,
        MaxSizeMB = @MaxSizeMB,
        IsEnabled = @IsEnabled,
        DisplayName = @DisplayName,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @Id;

    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    WHERE Id = @Id;
END
GO

-- Delete
IF OBJECT_ID('dbo.csp_AssetFileTypes_Delete', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_Delete;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.AssetFileTypes WHERE Id = @Id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- ToggleEnabled
IF OBJECT_ID('dbo.csp_AssetFileTypes_ToggleEnabled', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_AssetFileTypes_ToggleEnabled;
GO
CREATE PROCEDURE dbo.csp_AssetFileTypes_ToggleEnabled
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.AssetFileTypes
    SET IsEnabled = CASE WHEN IsEnabled = 1 THEN 0 ELSE 1 END,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @Id;

    SELECT Id, MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName, CreatedAt, UpdatedAt
    FROM dbo.AssetFileTypes
    WHERE Id = @Id;
END
GO

-- =====================================================
-- 3. Asset Browse / Stats stored procedures
-- =====================================================

-- Browse assets with pagination and filters
IF OBJECT_ID('dbo.csp_Assets_Browse', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_Browse;
GO
CREATE PROCEDURE dbo.csp_Assets_Browse
    @Page INT = 1,
    @PageSize INT = 50,
    @ContentTypeFilter NVARCHAR(50) = NULL,   -- 'image', 'video', 'document', or full mime type
    @Folder NVARCHAR(255) = NULL,
    @ObjectType NVARCHAR(100) = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL,
    @Search NVARCHAR(255) = NULL,
    @IncludeDeleted BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    -- Get total count
    SELECT COUNT(*) AS TotalCount
    FROM dbo.Assets
    WHERE (@IncludeDeleted = 1 OR IsDeleted = 0)
      AND (@ContentTypeFilter IS NULL 
           OR ContentType LIKE @ContentTypeFilter + '%'
           OR (@ContentTypeFilter = 'image' AND ContentType LIKE 'image/%')
           OR (@ContentTypeFilter = 'video' AND ContentType LIKE 'video/%')
           OR (@ContentTypeFilter = 'document' AND (ContentType LIKE 'application/pdf%' OR ContentType LIKE 'application/msword%' OR ContentType LIKE 'application/vnd.openxmlformats%')))
      AND (@Folder IS NULL OR Folder = @Folder)
      AND (@ObjectType IS NULL OR ObjectType = @ObjectType)
      AND (@DateFrom IS NULL OR CreatedAt >= @DateFrom)
      AND (@DateTo IS NULL OR CreatedAt <= @DateTo)
      AND (@Search IS NULL OR OriginalFileName LIKE '%' + @Search + '%' OR FileName LIKE '%' + @Search + '%');

    -- Get page of results
    SELECT FileId, FileName, OriginalFileName, ContentType, FileSize, StorageProvider, StoragePath,
           Folder, ObjectType, ObjectId, UploadedBy, Status, SortOrder, Caption,
           CreatedAt, IsDeleted, DeletedAt
    FROM dbo.Assets
    WHERE (@IncludeDeleted = 1 OR IsDeleted = 0)
      AND (@ContentTypeFilter IS NULL 
           OR ContentType LIKE @ContentTypeFilter + '%'
           OR (@ContentTypeFilter = 'image' AND ContentType LIKE 'image/%')
           OR (@ContentTypeFilter = 'video' AND ContentType LIKE 'video/%')
           OR (@ContentTypeFilter = 'document' AND (ContentType LIKE 'application/pdf%' OR ContentType LIKE 'application/msword%' OR ContentType LIKE 'application/vnd.openxmlformats%')))
      AND (@Folder IS NULL OR Folder = @Folder)
      AND (@ObjectType IS NULL OR ObjectType = @ObjectType)
      AND (@DateFrom IS NULL OR CreatedAt >= @DateFrom)
      AND (@DateTo IS NULL OR CreatedAt <= @DateTo)
      AND (@Search IS NULL OR OriginalFileName LIKE '%' + @Search + '%' OR FileName LIKE '%' + @Search + '%')
    ORDER BY CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- Asset Stats
IF OBJECT_ID('dbo.csp_Assets_GetStats', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_GetStats;
GO
CREATE PROCEDURE dbo.csp_Assets_GetStats
AS
BEGIN
    SET NOCOUNT ON;

    -- Total counts
    SELECT 
        COUNT(*) AS TotalAssets,
        SUM(CASE WHEN IsDeleted = 0 THEN 1 ELSE 0 END) AS ActiveAssets,
        SUM(CASE WHEN IsDeleted = 1 THEN 1 ELSE 0 END) AS DeletedAssets,
        SUM(CASE WHEN IsDeleted = 0 THEN FileSize ELSE 0 END) AS TotalSizeBytes
    FROM dbo.Assets;

    -- By content type category
    SELECT 
        CASE 
            WHEN ContentType LIKE 'image/%' THEN 'Image'
            WHEN ContentType LIKE 'video/%' THEN 'Video'
            WHEN ContentType LIKE 'application/pdf%' THEN 'Document'
            WHEN ContentType LIKE 'application/msword%' OR ContentType LIKE 'application/vnd.openxmlformats%' THEN 'Document'
            ELSE 'Other'
        END AS Category,
        COUNT(*) AS FileCount,
        SUM(FileSize) AS TotalSizeBytes
    FROM dbo.Assets
    WHERE IsDeleted = 0
    GROUP BY 
        CASE 
            WHEN ContentType LIKE 'image/%' THEN 'Image'
            WHEN ContentType LIKE 'video/%' THEN 'Video'
            WHEN ContentType LIKE 'application/pdf%' THEN 'Document'
            WHEN ContentType LIKE 'application/msword%' OR ContentType LIKE 'application/vnd.openxmlformats%' THEN 'Document'
            ELSE 'Other'
        END;

    -- By folder
    SELECT 
        ISNULL(Folder, '(none)') AS Folder,
        COUNT(*) AS FileCount,
        SUM(FileSize) AS TotalSizeBytes
    FROM dbo.Assets
    WHERE IsDeleted = 0
    GROUP BY Folder
    ORDER BY FileCount DESC;
END
GO

-- Get assets for migration
IF OBJECT_ID('dbo.csp_Assets_GetForMigration', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_GetForMigration;
GO
CREATE PROCEDURE dbo.csp_Assets_GetForMigration
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Return all assets (including deleted) that may need path migration
    -- A file needs migration if its StoragePath contains a GUID pattern (hex with dashes)
    SELECT FileId, FileName, OriginalFileName, ContentType, FileSize, 
           StorageProvider, StoragePath, Folder, ObjectType, ObjectId,
           UploadedBy, Status, SortOrder, Caption, CreatedAt, IsDeleted, DeletedAt
    FROM dbo.Assets
    ORDER BY FileId;
END
GO

-- Update asset StoragePath after migration
IF OBJECT_ID('dbo.csp_Assets_UpdateStoragePath', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_UpdateStoragePath;
GO
CREATE PROCEDURE dbo.csp_Assets_UpdateStoragePath
    @FileId INT,
    @NewStoragePath NVARCHAR(1000),
    @NewFileName NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Assets
    SET StoragePath = @NewStoragePath,
        FileName = @NewFileName
    WHERE FileId = @FileId;
END
GO

-- Update asset metadata (caption, sort order, status)
IF OBJECT_ID('dbo.csp_Assets_UpdateMeta', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_UpdateMeta;
GO
CREATE PROCEDURE dbo.csp_Assets_UpdateMeta
    @FileId INT,
    @Caption NVARCHAR(500) = NULL,
    @SortOrder INT = NULL,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Assets
    SET Caption = ISNULL(@Caption, Caption),
        SortOrder = ISNULL(@SortOrder, SortOrder),
        Status = ISNULL(@Status, Status)
    WHERE FileId = @FileId AND IsDeleted = 0;

    SELECT FileId, FileName, OriginalFileName, ContentType, FileSize, StorageProvider, StoragePath,
           Folder, ObjectType, ObjectId, UploadedBy, Status, SortOrder, Caption,
           CreatedAt, IsDeleted, DeletedAt
    FROM dbo.Assets
    WHERE FileId = @FileId;
END
GO

-- Soft delete single asset
IF OBJECT_ID('dbo.csp_Assets_SoftDelete', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_SoftDelete;
GO
CREATE PROCEDURE dbo.csp_Assets_SoftDelete
    @FileId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Assets
    SET IsDeleted = 1,
        DeletedAt = GETUTCDATE()
    WHERE FileId = @FileId AND IsDeleted = 0;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Bulk soft delete
IF OBJECT_ID('dbo.csp_Assets_BulkSoftDelete', 'P') IS NOT NULL DROP PROCEDURE dbo.csp_Assets_BulkSoftDelete;
GO
-- NOTE: SQL Server 2014 has no OPENJSON. We accept a comma-separated list of IDs.
CREATE PROCEDURE dbo.csp_Assets_BulkSoftDelete
    @FileIds NVARCHAR(MAX)  -- comma-separated list of FileIds
AS
BEGIN
    SET NOCOUNT ON;

    -- Parse comma-separated IDs into a temp table
    CREATE TABLE #Ids (FileId INT);

    DECLARE @xml XML = CAST('<i>' + REPLACE(@FileIds, ',', '</i><i>') + '</i>' AS XML);
    INSERT INTO #Ids (FileId)
    SELECT T.c.value('.', 'INT')
    FROM @xml.nodes('/i') T(c)
    WHERE T.c.value('.', 'NVARCHAR(20)') <> '';

    UPDATE a
    SET a.IsDeleted = 1,
        a.DeletedAt = GETUTCDATE()
    FROM dbo.Assets a
    INNER JOIN #Ids i ON a.FileId = i.FileId
    WHERE a.IsDeleted = 0;

    SELECT @@ROWCOUNT AS RowsAffected;

    DROP TABLE #Ids;
END
GO

-- =====================================================
-- 4. Seed data for common file types
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM dbo.AssetFileTypes)
BEGIN
    INSERT INTO dbo.AssetFileTypes (MimeType, Extensions, Category, MaxSizeMB, IsEnabled, DisplayName)
    VALUES
        ('image/jpeg',       '.jpg,.jpeg',  'Image',    20,  1, 'JPEG Image'),
        ('image/png',        '.png',        'Image',    20,  1, 'PNG Image'),
        ('image/gif',        '.gif',        'Image',    10,  1, 'GIF Image'),
        ('image/webp',       '.webp',       'Image',    20,  1, 'WebP Image'),
        ('image/svg+xml',    '.svg',        'Image',    5,   1, 'SVG Image'),
        ('image/bmp',        '.bmp',        'Image',    20,  1, 'BMP Image'),
        ('image/tiff',       '.tiff,.tif',  'Image',    50,  0, 'TIFF Image'),
        ('video/mp4',        '.mp4',        'Video',    100, 1, 'MP4 Video'),
        ('video/webm',       '.webm',       'Video',    100, 1, 'WebM Video'),
        ('video/ogg',        '.ogg',        'Video',    100, 1, 'OGG Video'),
        ('video/quicktime',  '.mov',        'Video',    100, 1, 'QuickTime Video'),
        ('application/pdf',  '.pdf',        'Document', 20,  1, 'PDF Document'),
        ('application/msword', '.doc',      'Document', 20,  1, 'Word Document (Legacy)'),
        ('application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx', 'Document', 20, 1, 'Word Document'),
        ('application/vnd.ms-excel', '.xls', 'Document', 20, 0, 'Excel Spreadsheet (Legacy)'),
        ('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx', 'Document', 20, 0, 'Excel Spreadsheet'),
        ('audio/mpeg',       '.mp3',        'Audio',    20,  1, 'MP3 Audio'),
        ('audio/wav',        '.wav',        'Audio',    50,  0, 'WAV Audio'),
        ('audio/ogg',        '.oga',        'Audio',    20,  0, 'OGG Audio');

    PRINT 'AssetFileTypes seed data inserted.';
END
ELSE
BEGIN
    PRINT 'AssetFileTypes already has data, skipping seed.';
END
GO

PRINT 'Migration 021_AddAssetFileTypes complete.';
GO
