-- Sample Data: 200 Raffle Participants with varied ticket counts
-- Distribution:
--   20% (40 people) = 1 ticket
--   20% (40 people) = 2 tickets
--   20% (40 people) = 5 tickets
--   5%  (10 people) = 10 tickets
--   5%  (10 people) = 20 tickets
--   30% (60 people) = random 1-50 tickets
--
-- IMPORTANT: Set @RaffleId to your target raffle before running!

DECLARE @RaffleId INT = 1;  -- <== CHANGE THIS to your raffle ID

-- Check if raffle exists
IF NOT EXISTS (SELECT 1 FROM Raffles WHERE RaffleId = @RaffleId)
BEGIN
    PRINT 'ERROR: Raffle with ID ' + CAST(@RaffleId AS NVARCHAR(10)) + ' does not exist!';
    RETURN;
END

-- Get the current next ticket number
DECLARE @NextTicket INT;
SELECT @NextTicket = NextTicketNumber FROM Raffles WHERE RaffleId = @RaffleId;

DECLARE @i INT = 1;
DECLARE @TicketCount INT;
DECLARE @Name NVARCHAR(100);
DECLARE @Phone NVARCHAR(30);
DECLARE @TicketStart INT;
DECLARE @TotalTicketsAdded INT = 0;

-- Chinese surnames for realistic names
DECLARE @Surnames TABLE (Surname NVARCHAR(10));
INSERT INTO @Surnames VALUES
(N'王'),(N'李'),(N'张'),(N'刘'),(N'陈'),(N'杨'),(N'黄'),(N'赵'),(N'周'),(N'吴'),
(N'徐'),(N'孙'),(N'马'),(N'朱'),(N'胡'),(N'郭'),(N'何'),(N'林'),(N'罗'),(N'高');

DECLARE @GivenNames TABLE (GivenName NVARCHAR(10));
INSERT INTO @GivenNames VALUES
(N'伟'),(N'芳'),(N'娜'),(N'秀英'),(N'敏'),(N'静'),(N'丽'),(N'强'),(N'磊'),(N'军'),
(N'洋'),(N'勇'),(N'艳'),(N'杰'),(N'娟'),(N'涛'),(N'明'),(N'超'),(N'秀兰'),(N'霞'),
(N'平'),(N'刚'),(N'桂英'),(N'华'),(N'梅'),(N'鑫'),(N'波'),(N'斌'),(N'玲'),(N'婷');

PRINT 'Creating 200 participants for Raffle ID: ' + CAST(@RaffleId AS NVARCHAR(10));
PRINT 'Starting ticket number: ' + CAST(@NextTicket AS NVARCHAR(10));

WHILE @i <= 200
BEGIN
    -- Determine ticket count based on distribution
    IF @i <= 40
        SET @TicketCount = 1;      -- 20%: 1 ticket
    ELSE IF @i <= 80
        SET @TicketCount = 2;      -- 20%: 2 tickets
    ELSE IF @i <= 120
        SET @TicketCount = 5;      -- 20%: 5 tickets
    ELSE IF @i <= 130
        SET @TicketCount = 10;     -- 5%: 10 tickets
    ELSE IF @i <= 140
        SET @TicketCount = 20;     -- 5%: 20 tickets
    ELSE
        SET @TicketCount = ABS(CHECKSUM(NEWID())) % 50 + 1;  -- 30%: random 1-50

    -- Generate random name
    SET @Name = (SELECT TOP 1 Surname FROM @Surnames ORDER BY NEWID()) +
                (SELECT TOP 1 GivenName FROM @GivenNames ORDER BY NEWID());

    -- Generate random phone number (138xxxxxxxx format)
    SET @Phone = '138' + RIGHT('00000000' + CAST(ABS(CHECKSUM(NEWID())) % 100000000 AS NVARCHAR(8)), 8);

    -- Calculate ticket range
    SET @TicketStart = @NextTicket;

    -- Insert participant
    INSERT INTO RaffleParticipants (
        RaffleId, Name, PhoneNumber, TotalTickets, TotalPaid,
        TicketStart, TicketEnd,
        PaymentStatus, PaymentMethod, PaymentDate,
        IsVerified, VerifiedAt, CreatedAt
    ) VALUES (
        @RaffleId,
        @Name,
        @Phone,
        @TicketCount,
        @TicketCount * 10.00,  -- Assuming $10 per ticket
        @TicketStart,
        @TicketStart + @TicketCount - 1,
        'Paid',
        'Test Data',
        GETUTCDATE(),
        1,  -- Verified
        GETUTCDATE(),
        GETUTCDATE()
    );

    -- Update counters
    SET @NextTicket = @NextTicket + @TicketCount;
    SET @TotalTicketsAdded = @TotalTicketsAdded + @TicketCount;
    SET @i = @i + 1;
END

-- Update raffle totals
UPDATE Raffles
SET NextTicketNumber = @NextTicket,
    TotalTicketsSold = TotalTicketsSold + @TotalTicketsAdded,
    TotalRevenue = TotalRevenue + (@TotalTicketsAdded * 10.00),
    UpdatedAt = GETUTCDATE()
WHERE RaffleId = @RaffleId;

PRINT '';
PRINT '=== Summary ===';
PRINT 'Participants created: 200';
PRINT 'Total tickets added: ' + CAST(@TotalTicketsAdded AS NVARCHAR(10));
PRINT 'Next ticket number: ' + CAST(@NextTicket AS NVARCHAR(10));
PRINT '';
PRINT 'Distribution:';
PRINT '  1 ticket:  40 people';
PRINT '  2 tickets: 40 people';
PRINT '  5 tickets: 40 people';
PRINT '  10 tickets: 10 people';
PRINT '  20 tickets: 10 people';
PRINT '  Random 1-50: 60 people';

-- Show sample of created participants
SELECT TOP 10
    ParticipantId, Name, PhoneNumber, TotalTickets,
    TicketStart, TicketEnd, PaymentStatus
FROM RaffleParticipants
WHERE RaffleId = @RaffleId
ORDER BY ParticipantId DESC;
