/* =====================================================================
 Nếu dùng sqlcmd phải thêm cờ -I (filtered index cần QUOTED_IDENTIFIER ON).

   1. Tạo 2 chỉ mục trên bảng thật: SensorData (composite + INCLUDE) và SensorAlerts (filtered).
   2. Dựng bảng benchmark SensorData_Bench (~1 triệu dòng) và SensorAlerts_Bench (300.000 dòng)
      giống cấu trúc bảng thật. KHÔNG nạp thẳng vào SensorData vì trigger sẽ làm sai dữ liệu seed.
   3. Đo bằng SET STATISTICS IO, TIME ON. 
   -- Dọn dẹp khi cần nạp lại: DROP TABLE dbo.SensorData_Bench; DROP TABLE dbo.SensorAlerts_Bench;
   ===================================================================== */
USE SmartMushroomDB;
GO
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

/* ---------- 1. CHỈ MỤC TRÊN BẢNG THẬT ---------- */

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE object_id = OBJECT_ID(N'dbo.SensorData') AND name = N'IX_SensorData_Room_RecordedAt')
    CREATE NONCLUSTERED INDEX IX_SensorData_Room_RecordedAt
        ON dbo.SensorData (RoomID ASC, RecordedAt DESC)
        INCLUDE (Temperature, Humidity, CO2Level);

-- Backend phải viết đúng IsResolved = 0 (hằng số), nếu dùng tham số thì không dùng được filtered index
IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE object_id = OBJECT_ID(N'dbo.SensorAlerts') AND name = N'IX_SensorAlerts_Unresolved')
    CREATE NONCLUSTERED INDEX IX_SensorAlerts_Unresolved
        ON dbo.SensorAlerts (RoomID ASC, AlertTime DESC)
        INCLUDE (AlertType, Severity, Message)
        WHERE IsResolved = 0;
GO

/* ---------- 2. BẢNG BENCHMARK ---------- */

IF OBJECT_ID(N'dbo.SensorData_Bench', N'U') IS NULL
    CREATE TABLE dbo.SensorData_Bench (
        DataID      BIGINT IDENTITY(1,1) NOT NULL,
        RoomID      INT          NOT NULL,
        Temperature DECIMAL(5,2) NOT NULL,
        Humidity    DECIMAL(5,2) NOT NULL,
        CO2Level    DECIMAL(7,2) NOT NULL,
        RecordedAt  DATETIME2(3) NOT NULL,
        CONSTRAINT PK_SensorData_Bench PRIMARY KEY CLUSTERED (DataID)
    );

IF OBJECT_ID(N'dbo.SensorAlerts_Bench', N'U') IS NULL
    CREATE TABLE dbo.SensorAlerts_Bench (
        AlertID    INT IDENTITY(1,1) NOT NULL,
        RoomID     INT           NOT NULL,
        AlertType  VARCHAR(50)   NOT NULL,
        Severity   VARCHAR(20)   NOT NULL,
        Message    NVARCHAR(500) NOT NULL,
        AlertTime  DATETIME2(3)  NOT NULL,
        IsResolved BIT           NOT NULL,
        CONSTRAINT PK_SensorAlerts_Bench PRIMARY KEY CLUSTERED (AlertID)
    );
GO

-- ~1 triệu bản tin: mỗi buồng 1 bản tin / 30 giây, kết thúc 24/10/2026 08:00 (chỉ nạp nếu bảng còn trống)
IF NOT EXISTS (SELECT 1 FROM dbo.SensorData_Bench)
BEGIN
    DECLARE @RoomCount INT = (SELECT COUNT(*) FROM dbo.Rooms);
    IF @RoomCount = 0 THROW 50102, N'Rooms đang trống: chạy 03_seed_data.sql trước.', 1;
    DECLARE @N INT = 1000000 / @RoomCount;
    DECLARE @End DATETIME2(3) = CAST('2026-10-24T08:00:00' AS DATETIME2(3));

    INSERT INTO dbo.SensorData_Bench (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
    SELECT r.RoomID,
           CAST(24.0  + 1.5   * SIN(w.angle)       + (ABS(CAST(CHECKSUM(r.RoomID, nn.n, 1) AS BIGINT)) % 1000 / 1000.0 - 0.5) AS DECIMAL(5,2)),
           CAST(88.0  + 3.0   * SIN(w.angle + 1.0) + (ABS(CAST(CHECKSUM(r.RoomID, nn.n, 2) AS BIGINT)) % 1000 / 1000.0 - 0.5) * 2.0 AS DECIMAL(5,2)),
           CAST(600.0 + 120.0 * SIN(w.angle + 2.0) + (ABS(CAST(CHECKSUM(r.RoomID, nn.n, 3) AS BIGINT)) % 1000 / 1000.0 - 0.5) * 80.0 AS DECIMAL(7,2)),
           DATEADD(SECOND, (nn.n - (@N - 1)) * 30, @End)
    FROM dbo.Rooms r
    CROSS JOIN (SELECT TOP (@N) CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS INT) - 1 AS n
                FROM sys.all_objects a CROSS JOIN sys.all_objects b) nn
    CROSS APPLY (SELECT 2 * PI() * ((nn.n * 30) % 86400) / 86400.0 AS angle) w
    ORDER BY nn.n, r.RoomID;
END
GO

-- 300.000 cảnh báo, chỉ 200 cảnh báo mới nhất còn mở (IsResolved = 0)
IF NOT EXISTS (SELECT 1 FROM dbo.SensorAlerts_Bench)
BEGIN
    DECLARE @RoomCount2 INT = (SELECT COUNT(*) FROM dbo.Rooms);
    IF @RoomCount2 = 0 THROW 50102, N'Rooms đang trống: chạy 03_seed_data.sql trước.', 1;
    DECLARE @Rows INT = 300000;

    INSERT INTO dbo.SensorAlerts_Bench (RoomID, AlertType, Severity, Message, AlertTime, IsResolved)
    SELECT rr.RoomID,
           CHOOSE(((nn.n / 3) % 3) + 1, 'HIGH_CO2', 'HIGH_TEMP', 'LOW_HUMIDITY'),
           CHOOSE(((nn.n / 3) % 3) + 1, 'CRITICAL', 'WARNING', 'WARNING'),
           N'Cảnh báo giả lập số ' + CAST(nn.n AS NVARCHAR(10)),
           DATEADD(MINUTE, (nn.n - (@Rows - 1)) * 5, CAST('2026-10-24T08:00:00' AS DATETIME2(3))),
           CAST(CASE WHEN nn.n >= @Rows - 200 THEN 0 ELSE 1 END AS BIT)
    FROM (SELECT TOP (@Rows) CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS INT) - 1 AS n
          FROM sys.all_objects a CROSS JOIN sys.all_objects b) nn
    JOIN (SELECT RoomID, ROW_NUMBER() OVER (ORDER BY RoomID) - 1 AS idx FROM dbo.Rooms) rr
         ON rr.idx = nn.n % @RoomCount2
    ORDER BY nn.n;
END
GO

-- Cùng chỉ mục (cùng tên) trên bảng benchmark
IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE object_id = OBJECT_ID(N'dbo.SensorData_Bench') AND name = N'IX_SensorData_Room_RecordedAt')
    CREATE NONCLUSTERED INDEX IX_SensorData_Room_RecordedAt
        ON dbo.SensorData_Bench (RoomID ASC, RecordedAt DESC)
        INCLUDE (Temperature, Humidity, CO2Level);

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE object_id = OBJECT_ID(N'dbo.SensorAlerts_Bench') AND name = N'IX_SensorAlerts_Unresolved')
    CREATE NONCLUSTERED INDEX IX_SensorAlerts_Unresolved
        ON dbo.SensorAlerts_Bench (RoomID ASC, AlertTime DESC)
        INCLUDE (AlertType, Severity, Message)
        WHERE IsResolved = 0;

UPDATE STATISTICS dbo.SensorData_Bench   WITH FULLSCAN;
UPDATE STATISTICS dbo.SensorAlerts_Bench WITH FULLSCAN;
GO

/* ---------- 3. ĐO HIỆU NĂNG (chạy từng batch, ghi logical reads / CPU / elapsed ở tab Messages) ---------- */

-- BÀI 1: Biểu đồ vi khí hậu 24h của 1 buồng. A = quét toàn bảng, B = dùng chỉ mục
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

DECLARE @RoomID INT          = (SELECT MIN(RoomID) FROM dbo.Rooms);
DECLARE @To     DATETIME2(3) = CAST('2026-10-24T08:00:00' AS DATETIME2(3));
DECLARE @From   DATETIME2(3) = DATEADD(HOUR, -24, @To);

PRINT N'===== 1A: KHÔNG dùng chỉ mục =====';
SELECT RecordedAt, Temperature, Humidity, CO2Level
FROM dbo.SensorData_Bench WITH (INDEX(0))
WHERE RoomID = @RoomID AND RecordedAt >= @From AND RecordedAt <= @To
ORDER BY RecordedAt DESC
OPTION (RECOMPILE);

PRINT N'===== 1B: CÓ chỉ mục IX_SensorData_Room_RecordedAt =====';
SELECT RecordedAt, Temperature, Humidity, CO2Level
FROM dbo.SensorData_Bench
WHERE RoomID = @RoomID AND RecordedAt >= @From AND RecordedAt <= @To
ORDER BY RecordedAt DESC
OPTION (RECOMPILE);

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
GO

-- BÀI 2: Danh sách cảnh báo chưa xử lý (AlertFeed). A = quét toàn bảng, B = filtered index
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

PRINT N'===== 2A: KHÔNG dùng chỉ mục =====';
SELECT RoomID, AlertTime, AlertType, Severity, Message
FROM dbo.SensorAlerts_Bench WITH (INDEX(0))
WHERE IsResolved = 0
ORDER BY AlertTime DESC;

PRINT N'===== 2B: CÓ filtered index IX_SensorAlerts_Unresolved =====';
SELECT RoomID, AlertTime, AlertType, Severity, Message
FROM dbo.SensorAlerts_Bench
WHERE IsResolved = 0
ORDER BY AlertTime DESC;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
GO

