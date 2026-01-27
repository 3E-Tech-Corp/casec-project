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

-- Add Sample Participants (already verified with confirmed payments)
INSERT INTO RaffleParticipants (RaffleId, Name, PhoneNumber, AvatarUrl, IsVerified, VerifiedAt, TicketStart, TicketEnd, TotalTickets, TotalPaid, PaymentStatus, PaymentMethod, PaymentDate, IsWinner, SessionToken, CreatedAt, UpdatedAt)
VALUES
    (@RaffleId, 'John Smith', '5551234567', NULL, 1, GETUTCDATE(), 1, 10, 10, 20.00, 'Confirmed', 'Cash', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Sarah Johnson', '5552345678', NULL, 1, GETUTCDATE(), 11, 60, 50, 50.00, 'Confirmed', 'Credit Card', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Mike Williams', '5553456789', NULL, 1, GETUTCDATE(), 61, 63, 3, 10.00, 'Confirmed', 'Cash', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Emily Davis', '5554567890', NULL, 1, GETUTCDATE(), 64, 73, 10, 20.00, 'Confirmed', 'Venmo', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'David Brown', '5555678901', NULL, 1, GETUTCDATE(), 74, 74, 1, 5.00, 'Confirmed', 'Cash', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Jessica Miller', '5556789012', NULL, 1, GETUTCDATE(), 75, 124, 50, 50.00, 'Confirmed', 'Credit Card', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Chris Wilson', '5557890123', NULL, 1, GETUTCDATE(), 125, 134, 10, 20.00, 'Confirmed', 'Cash', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Amanda Taylor', '5558901234', NULL, 1, GETUTCDATE(), 135, 137, 3, 10.00, 'Confirmed', 'Zelle', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Ryan Martinez', '5559012345', NULL, 1, GETUTCDATE(), 138, 187, 50, 50.00, 'Confirmed', 'Cash', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE()),
    (@RaffleId, 'Nicole Anderson', '5550123456', NULL, 1, GETUTCDATE(), 188, 188, 1, 5.00, 'Confirmed', 'Credit Card', GETUTCDATE(), 0, NEWID(), GETUTCDATE(), GETUTCDATE());

-- Update raffle with ticket counts
UPDATE Raffles
SET NextTicketNumber = 189,
    TotalTicketsSold = 188,
    TotalRevenue = 240.00
WHERE RaffleId = @RaffleId;

PRINT 'Created 10 sample participants with 188 total tickets';

SELECT 'PARTICIPANTS:' AS Info;
SELECT ParticipantId, Name, PhoneNumber, TicketStart, TicketEnd, TotalTickets, TotalPaid, PaymentStatus
FROM RaffleParticipants WHERE RaffleId = @RaffleId ORDER BY TicketStart;

PRINT '';
PRINT '=== PARTICIPANT TICKET RANGES ===';
PRINT 'John Smith:      000001 - 000010 (10 tickets)';
PRINT 'Sarah Johnson:   000011 - 000060 (50 tickets)';
PRINT 'Mike Williams:   000061 - 000063 (3 tickets)';
PRINT 'Emily Davis:     000064 - 000073 (10 tickets)';
PRINT 'David Brown:     000074 - 000074 (1 ticket)';
PRINT 'Jessica Miller:  000075 - 000124 (50 tickets)';
PRINT 'Chris Wilson:    000125 - 000134 (10 tickets)';
PRINT 'Amanda Taylor:   000135 - 000137 (3 tickets)';
PRINT 'Ryan Martinez:   000138 - 000187 (50 tickets)';
PRINT 'Nicole Anderson: 000188 - 000188 (1 ticket)';
PRINT '';
PRINT '=== TEST INSTRUCTIONS ===';
PRINT '1. Go to /admin/raffles to see the raffle in the admin panel';
PRINT '2. Go to /raffle/' + CAST(@RaffleId AS VARCHAR(10)) + ' to register as a NEW participant';
PRINT '3. Or go to /raffle/' + CAST(@RaffleId AS VARCHAR(10)) + '/drawing to watch the drawing';
PRINT '4. In admin, click "Start Drawing" to begin';
PRINT '5. Reveal digits one by one - watch participants filter out!';
PRINT '6. Example: Reveal 0,0,0,0,7,4 to make David Brown the winner (ticket 000074)';
PRINT '';
PRINT 'Raffle ID for testing: ' + CAST(@RaffleId AS VARCHAR(10));
