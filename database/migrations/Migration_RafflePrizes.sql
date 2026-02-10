-- Migration: Add multiple prizes support and enhanced color settings for seat raffles
-- Date: 2026-02-10

-- Add new color/theme columns to SeatRaffles
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SeatRaffles') AND name = 'SeatBorderColor')
BEGIN
    ALTER TABLE SeatRaffles ADD SeatBorderColor NVARCHAR(50) NULL DEFAULT '#4a4a6a';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SeatRaffles') AND name = 'SeatOccupiedColor')
BEGIN
    ALTER TABLE SeatRaffles ADD SeatOccupiedColor NVARCHAR(50) NULL DEFAULT '#22c55e';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SeatRaffles') AND name = 'SeatVIPColor')
BEGIN
    ALTER TABLE SeatRaffles ADD SeatVIPColor NVARCHAR(50) NULL DEFAULT '#a855f7';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SeatRaffles') AND name = 'SeatEmptyColor')
BEGIN
    ALTER TABLE SeatRaffles ADD SeatEmptyColor NVARCHAR(50) NULL DEFAULT '#3a3a5a';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SeatRaffles') AND name = 'BackgroundOpacity')
BEGIN
    ALTER TABLE SeatRaffles ADD BackgroundOpacity DECIMAL(3,2) NULL DEFAULT 0.5;
END
GO

-- Create SeatRafflePrizes table for multiple prizes
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('SeatRafflePrizes') AND type = 'U')
BEGIN
    CREATE TABLE SeatRafflePrizes (
        PrizeId INT IDENTITY(1,1) PRIMARY KEY,
        SeatRaffleId INT NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NULL,
        ImageUrl NVARCHAR(500) NULL,
        Value DECIMAL(18,2) NULL,
        Quantity INT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_SeatRafflePrizes_SeatRaffle FOREIGN KEY (SeatRaffleId) 
            REFERENCES SeatRaffles(SeatRaffleId) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_SeatRafflePrizes_SeatRaffleId ON SeatRafflePrizes(SeatRaffleId);
END
GO

-- Add PrizeId to winners table to track which prize was won
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SeatRaffleWinners') AND name = 'PrizeId')
BEGIN
    ALTER TABLE SeatRaffleWinners ADD PrizeId INT NULL;
    
    ALTER TABLE SeatRaffleWinners ADD CONSTRAINT FK_SeatRaffleWinners_Prize 
        FOREIGN KEY (PrizeId) REFERENCES SeatRafflePrizes(PrizeId);
END
GO

PRINT 'Migration completed: RafflePrizes';
