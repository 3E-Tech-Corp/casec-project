-- Migration: 026_AddVipTicketPickup
-- Description: Add fields to track VIP ticket pickup status
-- Date: 2026-02-14

-- Add TicketPickedUp and PickedUpAt columns to SeatingSeats
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SeatingSeats' AND COLUMN_NAME = 'TicketPickedUp')
BEGIN
    ALTER TABLE SeatingSeats ADD TicketPickedUp BIT NOT NULL DEFAULT 0;
    PRINT 'Added TicketPickedUp column to SeatingSeats';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SeatingSeats' AND COLUMN_NAME = 'PickedUpAt')
BEGIN
    ALTER TABLE SeatingSeats ADD PickedUpAt DATETIME2 NULL;
    PRINT 'Added PickedUpAt column to SeatingSeats';
END
GO
