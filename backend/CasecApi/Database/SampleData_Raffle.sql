-- Sample Raffle Data for Testing
-- Run this script to create a test raffle with prizes and ticket tiers

DECLARE @RaffleId INT;

-- Create a sample raffle
INSERT INTO Raffles (Name, Description, ImageUrl, Status, TicketDigits, NextTicketNumber, TotalTicketsSold, TotalRevenue, StartDate, EndDate, DrawingDate, CreatedAt, UpdatedAt)
VALUES (
    'Summer Festival Raffle 2024',
    'Win amazing prizes at our annual summer festival! Grand prize is a $1000 cash prize. Multiple winners will be selected.',
    NULL,
    'Active',  -- Set to Active so it's ready for registration
    6,         -- 6-digit ticket numbers (000001 - 999999)
    1,         -- Next ticket starts at 1
    0,         -- No tickets sold yet
    0,         -- No revenue yet
    GETUTCDATE(),                        -- Starts now
    DATEADD(DAY, 30, GETUTCDATE()),      -- Ends in 30 days
    DATEADD(DAY, 31, GETUTCDATE()),      -- Drawing in 31 days
    GETUTCDATE(),
    GETUTCDATE()
);

SET @RaffleId = SCOPE_IDENTITY();

PRINT 'Created Raffle with ID: ' + CAST(@RaffleId AS VARCHAR(10));

-- Add Prizes
INSERT INTO RafflePrizes (RaffleId, Name, Description, ImageUrl, Value, DisplayOrder, IsGrandPrize, CreatedAt)
VALUES
    (@RaffleId, 'Grand Prize - $1,000 Cash', 'One thousand dollars in cold hard cash!', NULL, 1000.00, 1, 1, GETUTCDATE()),
    (@RaffleId, 'Second Prize - $500 Gift Card', 'Amazon gift card for all your shopping needs', NULL, 500.00, 2, 0, GETUTCDATE()),
    (@RaffleId, 'Third Prize - $250 Restaurant Voucher', 'Dine at any participating restaurant', NULL, 250.00, 3, 0, GETUTCDATE()),
    (@RaffleId, 'Fourth Prize - Movie Night Package', 'Tickets, popcorn, and drinks for 4', NULL, 100.00, 4, 0, GETUTCDATE());

PRINT 'Created 4 prizes';

-- Add Ticket Tiers
INSERT INTO RaffleTicketTiers (RaffleId, Name, Price, TicketCount, Description, DisplayOrder, IsActive, IsFeatured, CreatedAt)
VALUES
    (@RaffleId, 'Single Ticket', 5.00, 1, 'Try your luck with a single entry', 1, 1, 0, GETUTCDATE()),
    (@RaffleId, 'Triple Pack', 10.00, 3, 'Best value for beginners - 3 tickets', 2, 1, 0, GETUTCDATE()),
    (@RaffleId, 'Lucky Ten', 20.00, 10, 'Popular choice! 10 chances to win', 3, 1, 1, GETUTCDATE()),
    (@RaffleId, 'Mega Bundle', 50.00, 50, 'Serious contender pack - 50 tickets!', 4, 1, 0, GETUTCDATE());

PRINT 'Created 4 ticket tiers';

-- Display what was created
SELECT 'RAFFLE CREATED:' AS Info;
SELECT RaffleId, Name, Status, TicketDigits, StartDate, EndDate, DrawingDate
FROM Raffles WHERE RaffleId = @RaffleId;

SELECT 'PRIZES:' AS Info;
SELECT PrizeId, Name, Value, IsGrandPrize, DisplayOrder
FROM RafflePrizes WHERE RaffleId = @RaffleId ORDER BY DisplayOrder;

SELECT 'TICKET TIERS:' AS Info;
SELECT TierId, Name, Price, TicketCount, IsFeatured, DisplayOrder
FROM RaffleTicketTiers WHERE RaffleId = @RaffleId ORDER BY DisplayOrder;

PRINT '';
PRINT '=== TEST INSTRUCTIONS ===';
PRINT '1. Go to /admin/raffles to see the raffle in the admin panel';
PRINT '2. Go to /raffle/' + CAST(@RaffleId AS VARCHAR(10)) + ' to register as a participant';
PRINT '3. Enter your name and phone number to register';
PRINT '4. Enter the OTP shown on screen (dev mode shows it)';
PRINT '5. Purchase tickets from any tier';
PRINT '6. Go back to admin to confirm payment';
PRINT '7. Start the drawing and reveal digits one by one!';
PRINT '';
PRINT 'Raffle ID for testing: ' + CAST(@RaffleId AS VARCHAR(10));
