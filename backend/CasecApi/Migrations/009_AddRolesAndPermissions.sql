-- Migration: Add Roles and Permissions System
-- Date: 2026-01-27
-- Description: Creates tables for role-based access control for admin UI areas

-- Roles table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE [Roles] (
        [RoleId] INT NOT NULL IDENTITY(1,1),
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [IsSystem] BIT NOT NULL DEFAULT 0,  -- System roles cannot be deleted
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleId])
    );

    CREATE UNIQUE INDEX [IX_Roles_Name] ON [Roles] ([Name]);

    -- Insert default system roles
    INSERT INTO [Roles] ([Name], [Description], [IsSystem], [IsActive]) VALUES
    (N'Super Admin', N'Full access to all admin areas', 1, 1),
    (N'Content Manager', N'Manage events, programs, and content', 1, 1),
    (N'User Manager', N'Manage users and memberships', 1, 1),
    (N'Viewer', N'Read-only access to admin dashboard', 1, 1);

    PRINT 'Created Roles table with default roles';
END
GO

-- Admin Areas table (predefined list of admin UI sections)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AdminAreas')
BEGIN
    CREATE TABLE [AdminAreas] (
        [AreaId] INT NOT NULL IDENTITY(1,1),
        [AreaKey] NVARCHAR(50) NOT NULL,  -- Unique key for the area (e.g., 'users', 'events')
        [Name] NVARCHAR(100) NOT NULL,     -- Display name
        [Description] NVARCHAR(500) NULL,
        [Category] NVARCHAR(50) NULL,      -- Category for grouping (e.g., 'Users & Membership')
        [IconName] NVARCHAR(50) NULL,
        [Route] NVARCHAR(200) NULL,        -- Admin route path
        [DisplayOrder] INT NOT NULL DEFAULT 0,
        CONSTRAINT [PK_AdminAreas] PRIMARY KEY ([AreaId])
    );

    CREATE UNIQUE INDEX [IX_AdminAreas_AreaKey] ON [AdminAreas] ([AreaKey]);

    -- Insert all admin areas based on current menu structure
    INSERT INTO [AdminAreas] ([AreaKey], [Name], [Description], [Category], [Route], [DisplayOrder]) VALUES
    -- Dashboard
    (N'dashboard', N'Dashboard', N'View admin dashboard and statistics', N'Dashboard', N'/admin', 0),

    -- Users & Membership
    (N'users', N'Manage Users', N'View and manage user accounts', N'Users & Membership', N'/admin/users', 10),
    (N'membership-types', N'Membership Types', N'Manage membership types and pricing', N'Users & Membership', N'/admin/membership-types', 11),
    (N'payments', N'Payments', N'View and manage payments', N'Users & Membership', N'/admin/payments', 12),
    (N'payment-methods', N'Payment Methods', N'Configure payment methods', N'Users & Membership', N'/admin/payment-methods', 13),

    -- Content
    (N'clubs', N'Manage Clubs', N'Manage club information', N'Content', N'/admin/clubs', 20),
    (N'events', N'Manage Events', N'Create and manage events', N'Content', N'/admin/events', 21),
    (N'event-types', N'Event Types', N'Manage event type categories', N'Content', N'/admin/event-types', 22),
    (N'programs', N'Event Programs', N'Manage event programs and schedules', N'Content', N'/admin/programs', 23),
    (N'performers', N'Performers', N'Manage performer profiles', N'Content', N'/admin/performers', 24),
    (N'content-cards', N'Content Cards', N'Manage content cards for items', N'Content', N'/admin/content-cards', 25),

    -- Engagement
    (N'polls', N'Polls', N'Create and manage polls', N'Engagement', N'/admin/polls', 30),
    (N'surveys', N'Surveys', N'Create and manage surveys', N'Engagement', N'/admin/surveys', 31),
    (N'raffles', N'Raffles', N'Manage raffle events', N'Engagement', N'/admin/raffles', 32),

    -- Appearance
    (N'slideshows', N'SlideShows', N'Manage slideshow content', N'Appearance', N'/admin/slideshows', 40),
    (N'theme', N'Theme Settings', N'Customize site appearance', N'Appearance', N'/admin/theme', 41),

    -- System (new)
    (N'roles', N'Role Management', N'Manage roles and permissions', N'System', N'/admin/roles', 50);

    PRINT 'Created AdminAreas table with all admin sections';
END
GO

-- Role Area Permissions table (which roles can access which areas)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RoleAreaPermissions')
BEGIN
    CREATE TABLE [RoleAreaPermissions] (
        [PermissionId] INT NOT NULL IDENTITY(1,1),
        [RoleId] INT NOT NULL,
        [AreaId] INT NOT NULL,
        [CanView] BIT NOT NULL DEFAULT 1,
        [CanEdit] BIT NOT NULL DEFAULT 0,
        [CanDelete] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_RoleAreaPermissions] PRIMARY KEY ([PermissionId]),
        CONSTRAINT [FK_RoleAreaPermissions_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([RoleId]) ON DELETE CASCADE,
        CONSTRAINT [FK_RoleAreaPermissions_AreaId] FOREIGN KEY ([AreaId]) REFERENCES [AdminAreas]([AreaId]) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX [IX_RoleAreaPermissions_RoleArea] ON [RoleAreaPermissions] ([RoleId], [AreaId]);
    CREATE INDEX [IX_RoleAreaPermissions_RoleId] ON [RoleAreaPermissions] ([RoleId]);

    -- Grant Super Admin full access to all areas
    INSERT INTO [RoleAreaPermissions] ([RoleId], [AreaId], [CanView], [CanEdit], [CanDelete])
    SELECT
        (SELECT RoleId FROM Roles WHERE Name = 'Super Admin'),
        AreaId,
        1, 1, 1
    FROM AdminAreas;

    -- Grant Content Manager access to content-related areas
    INSERT INTO [RoleAreaPermissions] ([RoleId], [AreaId], [CanView], [CanEdit], [CanDelete])
    SELECT
        (SELECT RoleId FROM Roles WHERE Name = 'Content Manager'),
        AreaId,
        1, 1, 1
    FROM AdminAreas
    WHERE Category IN ('Content', 'Engagement', 'Appearance', 'Dashboard');

    -- Grant User Manager access to user-related areas
    INSERT INTO [RoleAreaPermissions] ([RoleId], [AreaId], [CanView], [CanEdit], [CanDelete])
    SELECT
        (SELECT RoleId FROM Roles WHERE Name = 'User Manager'),
        AreaId,
        1, 1, 1
    FROM AdminAreas
    WHERE Category IN ('Users & Membership', 'Dashboard');

    -- Grant Viewer read-only access to dashboard only
    INSERT INTO [RoleAreaPermissions] ([RoleId], [AreaId], [CanView], [CanEdit], [CanDelete])
    SELECT
        (SELECT RoleId FROM Roles WHERE Name = 'Viewer'),
        AreaId,
        1, 0, 0
    FROM AdminAreas
    WHERE AreaKey = 'dashboard';

    PRINT 'Created RoleAreaPermissions table with default permissions';
END
GO

-- User Roles table (which users have which roles)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE [UserRoles] (
        [UserRoleId] INT NOT NULL IDENTITY(1,1),
        [UserId] INT NOT NULL,
        [RoleId] INT NOT NULL,
        [AssignedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [AssignedBy] INT NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserRoleId]),
        CONSTRAINT [FK_UserRoles_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([RoleId]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_AssignedBy] FOREIGN KEY ([AssignedBy]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION
    );

    CREATE UNIQUE INDEX [IX_UserRoles_UserRole] ON [UserRoles] ([UserId], [RoleId]);
    CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles] ([UserId]);
    CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);

    -- Assign Super Admin role to existing admins
    INSERT INTO [UserRoles] ([UserId], [RoleId])
    SELECT
        UserId,
        (SELECT RoleId FROM Roles WHERE Name = 'Super Admin')
    FROM Users
    WHERE IsAdmin = 1;

    PRINT 'Created UserRoles table and assigned Super Admin role to existing admins';
END
GO

PRINT 'Roles and Permissions migration completed successfully';
