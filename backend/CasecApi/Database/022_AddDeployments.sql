-- Migration: Add Deployments table for tracking CI/CD deployment history
-- Date: 2026-01-30

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Deployments')
BEGIN
    CREATE TABLE Deployments (
        DeploymentId INT IDENTITY(1,1) PRIMARY KEY,
        Summary NVARCHAR(500) NOT NULL,
        CommitHash NVARCHAR(40) NULL,
        Branch NVARCHAR(100) NULL DEFAULT 'main',
        DeployedBy NVARCHAR(100) NULL DEFAULT 'GitHub Actions',
        Status NVARCHAR(20) NOT NULL DEFAULT 'success',
        DurationSeconds INT NULL,
        DeployedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );

    CREATE INDEX IX_Deployments_DeployedAt ON Deployments (DeployedAt DESC);
END
GO

-- Insert initial record to verify migration works
INSERT INTO Deployments (Summary, CommitHash, Branch, DeployedBy, Status)
VALUES (
    'CI/CD pipeline first deployment - migrations endpoint live',
    '660c7f8',
    'main',
    'GitHub Actions',
    'success'
);
