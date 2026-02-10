-- Seed Miramar Cultural Center Seating Chart
-- Based on actual venue layout for CASEC 2026 Spring Gala

DECLARE @ChartId INT;

-- Create the chart
INSERT INTO SeatingCharts (Name, Description, CreatedAt, UpdatedAt)
VALUES ('Miramar Cultural Center 2026', 'CASEC Spring Gala - February 15, 2026', GETUTCDATE(), GETUTCDATE());

SET @ChartId = SCOPE_IDENTITY();

-- Create sections
DECLARE @OrchLeftId INT, @OrchCenterId INT, @OrchRightId INT;
DECLARE @BalcLeftId INT, @BalcCenterId INT, @BalcRightId INT;

INSERT INTO SeatingChartSections (ChartId, Name, ShortName, DisplayOrder, SeatsPerRow, RowLabels, StartSeatNumber, CreatedAt)
VALUES (@ChartId, 'Orchestra Left', 'Orch-Left', 1, 11, 'D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W', 1, GETUTCDATE());
SET @OrchLeftId = SCOPE_IDENTITY();

INSERT INTO SeatingChartSections (ChartId, Name, ShortName, DisplayOrder, SeatsPerRow, RowLabels, StartSeatNumber, CreatedAt)
VALUES (@ChartId, 'Orchestra Center', 'Orch-Center', 2, 14, 'A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W', 101, GETUTCDATE());
SET @OrchCenterId = SCOPE_IDENTITY();

INSERT INTO SeatingChartSections (ChartId, Name, ShortName, DisplayOrder, SeatsPerRow, RowLabels, StartSeatNumber, CreatedAt)
VALUES (@ChartId, 'Orchestra Right', 'Orch-Right', 3, 11, 'D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W', 1, GETUTCDATE());
SET @OrchRightId = SCOPE_IDENTITY();

INSERT INTO SeatingChartSections (ChartId, Name, ShortName, DisplayOrder, SeatsPerRow, RowLabels, StartSeatNumber, CreatedAt)
VALUES (@ChartId, 'Balcony Left', 'Balc-Left', 4, 8, 'AA,BB,CC,DD,EE,FF', 1, GETUTCDATE());
SET @BalcLeftId = SCOPE_IDENTITY();

INSERT INTO SeatingChartSections (ChartId, Name, ShortName, DisplayOrder, SeatsPerRow, RowLabels, StartSeatNumber, CreatedAt)
VALUES (@ChartId, 'Balcony Center', 'Balc-Center', 5, 14, 'AA,BB,CC,DD,EE,FF', 101, GETUTCDATE());
SET @BalcCenterId = SCOPE_IDENTITY();

INSERT INTO SeatingChartSections (ChartId, Name, ShortName, DisplayOrder, SeatsPerRow, RowLabels, StartSeatNumber, CreatedAt)
VALUES (@ChartId, 'Balcony Right', 'Balc-Right', 6, 8, 'AA,BB,CC,DD,EE,FF', 1, GETUTCDATE());
SET @BalcRightId = SCOPE_IDENTITY();

-- Generate seats for Orchestra Left (rows D-W, varying seat counts)
-- D=7, E=8, F=8, G=9, H=9, J-L=10, M-W=11
DECLARE @Row NVARCHAR(2), @SeatCount INT, @i INT;

-- Orchestra Left
DECLARE @OrchLeftRows TABLE (RowLabel NVARCHAR(2), SeatCount INT);
INSERT INTO @OrchLeftRows VALUES 
('D',7),('E',8),('F',8),('G',9),('H',9),('J',10),('K',10),('L',10),
('M',11),('N',11),('P',11),('Q',11),('R',11),('S',11),('T',11),('U',11),('V',11),('W',11);

DECLARE row_cursor CURSOR FOR SELECT RowLabel, SeatCount FROM @OrchLeftRows;
OPEN row_cursor;
FETCH NEXT FROM row_cursor INTO @Row, @SeatCount;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 1;
    WHILE @i <= @SeatCount
    BEGIN
        INSERT INTO SeatingChartSeats (SectionId, RowLabel, SeatNumber, Status, CreatedAt)
        VALUES (@OrchLeftId, @Row, @i, 'Available', GETUTCDATE());
        SET @i = @i + 1;
    END
    FETCH NEXT FROM row_cursor INTO @Row, @SeatCount;
END
CLOSE row_cursor;
DEALLOCATE row_cursor;

-- Orchestra Center (rows A-W, varying seat counts)
-- A=6(105-110), B=8(104-111), C=12(102-113), D-R=14(101-114), S-T=10(103-112), U-W=14(101-114)
DECLARE @OrchCenterRows TABLE (RowLabel NVARCHAR(2), SeatCount INT, StartNum INT);
INSERT INTO @OrchCenterRows VALUES 
('A',6,105),('B',8,104),('C',12,102),
('D',14,101),('E',14,101),('F',14,101),('G',14,101),('H',14,101),
('J',14,101),('K',14,101),('L',14,101),('M',14,101),('N',14,101),
('P',14,101),('Q',14,101),('R',14,101),
('S',10,103),('T',10,103),
('U',14,101),('V',14,101),('W',14,101);

DECLARE @StartNum INT;
DECLARE center_cursor CURSOR FOR SELECT RowLabel, SeatCount, StartNum FROM @OrchCenterRows;
OPEN center_cursor;
FETCH NEXT FROM center_cursor INTO @Row, @SeatCount, @StartNum;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 0;
    WHILE @i < @SeatCount
    BEGIN
        INSERT INTO SeatingChartSeats (SectionId, RowLabel, SeatNumber, Status, CreatedAt)
        VALUES (@OrchCenterId, @Row, @StartNum + @i, 'Available', GETUTCDATE());
        SET @i = @i + 1;
    END
    FETCH NEXT FROM center_cursor INTO @Row, @SeatCount, @StartNum;
END
CLOSE center_cursor;
DEALLOCATE center_cursor;

-- Orchestra Right (mirror of Left)
DECLARE @OrchRightRows TABLE (RowLabel NVARCHAR(2), SeatCount INT);
INSERT INTO @OrchRightRows VALUES 
('D',7),('E',8),('F',8),('G',9),('H',9),('J',10),('K',10),('L',10),
('M',11),('N',11),('P',11),('Q',11),('R',11),('S',11),('T',11),('U',11),('V',11),('W',11);

DECLARE right_cursor CURSOR FOR SELECT RowLabel, SeatCount FROM @OrchRightRows;
OPEN right_cursor;
FETCH NEXT FROM right_cursor INTO @Row, @SeatCount;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 1;
    WHILE @i <= @SeatCount
    BEGIN
        INSERT INTO SeatingChartSeats (SectionId, RowLabel, SeatNumber, Status, CreatedAt)
        VALUES (@OrchRightId, @Row, @i, 'Available', GETUTCDATE());
        SET @i = @i + 1;
    END
    FETCH NEXT FROM right_cursor INTO @Row, @SeatCount;
END
CLOSE right_cursor;
DEALLOCATE right_cursor;

-- Balcony Left (rows AA-FF, 8 seats each)
DECLARE @BalcRows TABLE (RowLabel NVARCHAR(2));
INSERT INTO @BalcRows VALUES ('AA'),('BB'),('CC'),('DD'),('EE'),('FF');

DECLARE balc_cursor CURSOR FOR SELECT RowLabel FROM @BalcRows;
OPEN balc_cursor;
FETCH NEXT FROM balc_cursor INTO @Row;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 1;
    WHILE @i <= 8
    BEGIN
        INSERT INTO SeatingChartSeats (SectionId, RowLabel, SeatNumber, Status, CreatedAt)
        VALUES (@BalcLeftId, @Row, @i, 'Available', GETUTCDATE());
        SET @i = @i + 1;
    END
    FETCH NEXT FROM balc_cursor INTO @Row;
END
CLOSE balc_cursor;
DEALLOCATE balc_cursor;

-- Balcony Center (rows AA-FF, 14 seats each, 101-114)
DECLARE balc_center_cursor CURSOR FOR SELECT RowLabel FROM @BalcRows;
OPEN balc_center_cursor;
FETCH NEXT FROM balc_center_cursor INTO @Row;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 101;
    WHILE @i <= 114
    BEGIN
        INSERT INTO SeatingChartSeats (SectionId, RowLabel, SeatNumber, Status, CreatedAt)
        VALUES (@BalcCenterId, @Row, @i, 'Available', GETUTCDATE());
        SET @i = @i + 1;
    END
    FETCH NEXT FROM balc_center_cursor INTO @Row;
END
CLOSE balc_center_cursor;
DEALLOCATE balc_center_cursor;

-- Balcony Right (rows AA-FF, 8 seats each)
DECLARE balc_right_cursor CURSOR FOR SELECT RowLabel FROM @BalcRows;
OPEN balc_right_cursor;
FETCH NEXT FROM balc_right_cursor INTO @Row;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @i = 1;
    WHILE @i <= 8
    BEGIN
        INSERT INTO SeatingChartSeats (SectionId, RowLabel, SeatNumber, Status, CreatedAt)
        VALUES (@BalcRightId, @Row, @i, 'Available', GETUTCDATE());
        SET @i = @i + 1;
    END
    FETCH NEXT FROM balc_right_cursor INTO @Row;
END
CLOSE balc_right_cursor;
DEALLOCATE balc_right_cursor;

-- Output summary
SELECT 'Created chart' AS Status, @ChartId AS ChartId;
SELECT s.Name, COUNT(st.SeatId) AS SeatCount 
FROM SeatingChartSections s 
LEFT JOIN SeatingChartSeats st ON st.SectionId = s.SectionId
WHERE s.ChartId = @ChartId
GROUP BY s.Name, s.DisplayOrder
ORDER BY s.DisplayOrder;
