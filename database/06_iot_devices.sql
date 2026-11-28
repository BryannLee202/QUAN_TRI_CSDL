-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Database: SmartMushroomDB (Microsoft SQL Server / T-SQL)
-- File: 06_iot_devices.sql - Thiết bị IoT thật (ESP32): xác thực bằng API key,
--       nhận số đo cảm biến, tự động điều khiển phun sương / sưởi, trả lệnh relay
--
-- Luồng: ESP32 -> POST /api/iot/readings (header x-device-key)
--        -> sp_IngestDeviceReading: xác thực key -> INSERT SensorData
--           (trigger trg_CheckSensorThresholds sinh cảnh báo + tự bật quạt)
--           -> luật tự động phun sương / sưởi -> trả danh sách lệnh relay
--        ESP32 -> GET /api/iot/commands mỗi giây -> sp_GetDeviceCommands
--
-- Chạy SAU 05_audit_logs.sql. Chạy lại nhiều lần được (CREATE OR ALTER / IF NOT EXISTS).
-- API key KHÔNG lưu dạng rõ: chỉ lưu SHA-256 (64 ký tự hex in hoa).
-- ============================================================================

USE SmartMushroomDB;
GO

-- ----------------------------------------------------------------------------
-- 1. BẢNG THIẾT BỊ IOT (mỗi ESP32 gắn với 1 buồng nuôi)
-- ----------------------------------------------------------------------------
IF OBJECT_ID('IoTDevices', 'U') IS NULL
BEGIN
    CREATE TABLE IoTDevices (
        DeviceID INT IDENTITY(1,1) NOT NULL,
        RoomID INT NOT NULL,
        DeviceName NVARCHAR(100) NOT NULL,
        ApiKeyHash CHAR(64) NOT NULL,              -- SHA-256 của API key, hex in hoa
        FirmwareVersion VARCHAR(30) NULL,
        IpAddress VARCHAR(45) NULL,                -- IP cuối cùng gửi dữ liệu (IPv4/IPv6)
        IsActive BIT NOT NULL CONSTRAINT DF_IoTDevices_IsActive DEFAULT 1,
        LastSeenAt DATETIME2(3) NULL,              -- lần cuối liên lạc (gửi số đo hoặc hỏi lệnh)
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_IoTDevices_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_IoTDevices PRIMARY KEY CLUSTERED (DeviceID),
        CONSTRAINT FK_IoTDevices_Rooms FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
        CONSTRAINT UQ_IoTDevices_ApiKeyHash UNIQUE (ApiKeyHash),
        CONSTRAINT CK_IoTDevices_ApiKeyHash CHECK (LEN(ApiKeyHash) = 64)
    );
    PRINT N'>>> ĐÃ TẠO BẢNG IoTDevices <<<';
END
GO

-- Lấy lệnh gần nhất của từng thiết bị trong buồng (dùng mỗi giây khi ESP32 hỏi lệnh)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DeviceActionLogs_Room_Type_Action'
               AND object_id = OBJECT_ID('DeviceActionLogs'))
    CREATE NONCLUSTERED INDEX IX_DeviceActionLogs_Room_Type_Action
        ON DeviceActionLogs (RoomID, DeviceType, ActionID DESC)
        INCLUDE (ActionState, TriggeredBy, ExecutedAt);
GO

-- ----------------------------------------------------------------------------
-- 2. HÀM PHỤ TRỢ
-- ----------------------------------------------------------------------------
-- ActionState -> BẬT/TẮT: 'ON', 'AUTO_ON_75%', 'SPEED_70' là BẬT; 'OFF', 'AUTO_OFF', 'SPEED_0' là TẮT
CREATE OR ALTER FUNCTION dbo.fn_IsDeviceStateOn (@ActionState VARCHAR(20))
RETURNS BIT
AS
BEGIN
    IF @ActionState IS NULL RETURN 0;
    DECLARE @s VARCHAR(20) = UPPER(@ActionState);
    IF @s LIKE '%OFF%' OR @s = 'SPEED_0' RETURN 0;
    IF @s LIKE '%ON%' OR @s LIKE 'SPEED[_]%' RETURN 1;
    RETURN 0;
END
GO

-- TriggeredBy -> lệnh tự động hay lệnh tay
CREATE OR ALTER FUNCTION dbo.fn_IsAutoTrigger (@TriggeredBy NVARCHAR(100))
RETURNS BIT
AS
BEGIN
    IF @TriggeredBy IS NULL RETURN 0;
    IF @TriggeredBy IN (N'T_SQL_TRIGGER_AUTO', N'SCHEDULED_CRON', N'IOT_AUTO_RULE')
       OR @TriggeredBy LIKE N'%AUTO%'
        RETURN 1;
    RETURN 0;
END
GO

-- ----------------------------------------------------------------------------
-- 3. VIEW TRẠNG THÁI THIẾT BỊ (online nếu liên lạc trong 60 giây gần nhất)
-- ----------------------------------------------------------------------------
CREATE OR ALTER VIEW dbo.vw_IoTDeviceStatus
AS
SELECT d.DeviceID, d.RoomID, r.RoomCode, r.RoomName, d.DeviceName,
       d.FirmwareVersion, d.IpAddress, d.IsActive, d.LastSeenAt, d.CreatedAt,
       CAST(CASE WHEN d.IsActive = 1 AND d.LastSeenAt >= DATEADD(SECOND, -60, SYSDATETIME())
                 THEN 1 ELSE 0 END AS BIT) AS IsOnline,
       DATEDIFF(SECOND, d.LastSeenAt, SYSDATETIME()) AS SecondsSinceSeen
FROM IoTDevices d
JOIN Rooms r ON r.RoomID = d.RoomID;
GO

-- ----------------------------------------------------------------------------
-- 4. DANH SÁCH LỆNH RELAY CỦA BUỒNG
--    kind (tên dùng trong firmware) <-> DeviceType (tên trong DeviceActionLogs):
--    mist   <- MISTING_SYSTEM / MIST_MAKER (nút phun sương trên camera dùng MIST_MAKER)
--    fan    <- EXHAUST_FAN
--    light  <- GROW_LIGHT  (LED nhỏ mô phỏng đèn chiếu sáng)
--    heater <- HEATER      (LED nhỏ mô phỏng sưởi)
-- ----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_GetRoomDeviceCommands
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Kinds AS (
        SELECT Kind, DeviceType, IsPrimary
        FROM (VALUES ('mist',   'MISTING_SYSTEM', 1),
                     ('mist',   'MIST_MAKER',     0),
                     ('fan',    'EXHAUST_FAN',    1),
                     ('light',  'GROW_LIGHT',     1),
                     ('heater', 'HEATER',         1)) k (Kind, DeviceType, IsPrimary)
    ),
    Latest AS (
        SELECT k.Kind, d.ActionState, d.TriggeredBy, d.ExecutedAt,
               ROW_NUMBER() OVER (PARTITION BY k.Kind ORDER BY d.ActionID DESC) AS rn
        FROM Kinds k
        JOIN DeviceActionLogs d ON d.RoomID = @RoomID AND d.DeviceType = k.DeviceType
    )
    SELECT k.Kind,
           k.DeviceType,
           CAST(dbo.fn_IsDeviceStateOn(l.ActionState) AS BIT) AS State,
           CASE WHEN l.TriggeredBy IS NULL OR dbo.fn_IsAutoTrigger(l.TriggeredBy) = 1
                THEN 'auto' ELSE 'manual' END AS Mode,
           ISNULL(l.ActionState, 'OFF') AS ActionState,
           l.TriggeredBy,
           l.ExecutedAt
    FROM Kinds k
    LEFT JOIN Latest l ON l.Kind = k.Kind AND l.rn = 1
    WHERE k.IsPrimary = 1
    ORDER BY CASE k.Kind WHEN 'mist' THEN 1 WHEN 'fan' THEN 2 WHEN 'light' THEN 3 ELSE 4 END;
END
GO

-- ----------------------------------------------------------------------------
-- 5. ESP32 HỎI LỆNH: xác thực key, cập nhật LastSeenAt, trả lệnh
-- ----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_GetDeviceCommands
    @ApiKeyHash CHAR(64),
    @IpAddress VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @DeviceID INT, @RoomID INT;

    SELECT @DeviceID = DeviceID, @RoomID = RoomID
    FROM IoTDevices
    WHERE ApiKeyHash = @ApiKeyHash AND IsActive = 1;

    IF @DeviceID IS NULL
        THROW 50401, N'DEVICE_UNAUTHORIZED: API key của thiết bị không hợp lệ hoặc thiết bị đã bị khóa.', 1;

    UPDATE IoTDevices
    SET LastSeenAt = SYSDATETIME(), IpAddress = ISNULL(@IpAddress, IpAddress)
    WHERE DeviceID = @DeviceID;

    SELECT @DeviceID AS DeviceID, @RoomID AS RoomID;
    EXEC dbo.sp_GetRoomDeviceCommands @RoomID = @RoomID;
END
GO

-- ----------------------------------------------------------------------------
-- 6. ESP32 GỬI SỐ ĐO
--    - Xác thực key, kiểm tra số đo, INSERT SensorData (trigger sinh cảnh báo + bật quạt theo CO2)
--    - Luật tự động có trễ (hysteresis) cho phun sương và sưởi:
--        phun sương: BẬT khi độ ẩm < HumidityMin, TẮT khi độ ẩm >= HumidityMin + 3
--        sưởi      : BẬT khi nhiệt độ < TempMin,   TẮT khi nhiệt độ >= TempMin + 1
--    - Lệnh tay của kỹ thuật viên được ưu tiên 10 phút, sau đó luật tự động chạy lại
--    - Đèn chiếu sáng chỉ điều khiển tay
-- ----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_IngestDeviceReading
    @ApiKeyHash CHAR(64),
    @Temperature DECIMAL(5,2),
    @Humidity DECIMAL(5,2),
    @CO2Level DECIMAL(7,2),
    @FirmwareVersion VARCHAR(30) = NULL,
    @IpAddress VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @DeviceID INT, @RoomID INT;
    SELECT @DeviceID = DeviceID, @RoomID = RoomID
    FROM IoTDevices
    WHERE ApiKeyHash = @ApiKeyHash AND IsActive = 1;

    IF @DeviceID IS NULL
        THROW 50401, N'DEVICE_UNAUTHORIZED: API key của thiết bị không hợp lệ hoặc thiết bị đã bị khóa.', 1;

    IF @Temperature IS NULL OR @Humidity IS NULL OR @CO2Level IS NULL
        THROW 50400, N'INVALID_READING: Cần đủ temperature, humidity và co2.', 1;
    IF @Temperature NOT BETWEEN -10 AND 60 OR @Humidity NOT BETWEEN 0 AND 100
       OR @CO2Level NOT BETWEEN 0 AND 10000
        THROW 50400, N'INVALID_READING: Số đo ngoài phạm vi (nhiệt độ -10..60°C, độ ẩm 0..100%, CO2 0..10000 ppm).', 1;

    DECLARE @HumidityMin DECIMAL(5,2), @TempMin DECIMAL(5,2);
    SELECT @HumidityMin = HumidityMin, @TempMin = TempMin FROM Rooms WHERE RoomID = @RoomID;

    DECLARE @Now DATETIME2(3) = SYSDATETIME();
    DECLARE @DataID BIGINT;

    BEGIN TRANSACTION;

    INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
    VALUES (@RoomID, @Temperature, @Humidity, @CO2Level, @Now);
    SET @DataID = SCOPE_IDENTITY();

    UPDATE IoTDevices
    SET LastSeenAt = @Now,
        IpAddress = ISNULL(@IpAddress, IpAddress),
        FirmwareVersion = ISNULL(@FirmwareVersion, FirmwareVersion)
    WHERE DeviceID = @DeviceID;

    -- Luật tự động: mỗi thiết bị một dòng, áp dụng cùng một khuôn
    DECLARE @Rules TABLE (DeviceType VARCHAR(50), AltType VARCHAR(50), NeedOn BIT, CanOff BIT, Reason NVARCHAR(200));
    INSERT INTO @Rules VALUES
        ('MISTING_SYSTEM', 'MIST_MAKER',
         CASE WHEN @Humidity < @HumidityMin THEN 1 ELSE 0 END,
         CASE WHEN @Humidity >= @HumidityMin + 3 THEN 1 ELSE 0 END,
         CONCAT(N'Độ ẩm ', @Humidity, N'% so với ngưỡng tối thiểu ', @HumidityMin, N'%')),
        ('HEATER', 'HEATER',
         CASE WHEN @Temperature < @TempMin THEN 1 ELSE 0 END,
         CASE WHEN @Temperature >= @TempMin + 1 THEN 1 ELSE 0 END,
         CONCAT(N'Nhiệt độ ', @Temperature, N'°C so với ngưỡng tối thiểu ', @TempMin, N'°C'));

    ;WITH LastAction AS (
        SELECT ru.DeviceType, ru.NeedOn, ru.CanOff, ru.Reason,
               la.ActionState, la.TriggeredBy, la.ExecutedAt
        FROM @Rules ru
        OUTER APPLY (
            SELECT TOP (1) d.ActionState, d.TriggeredBy, d.ExecutedAt
            FROM DeviceActionLogs d
            WHERE d.RoomID = @RoomID AND d.DeviceType IN (ru.DeviceType, ru.AltType)
            ORDER BY d.ActionID DESC
        ) la
    ),
    Decision AS (
        SELECT DeviceType, Reason,
               dbo.fn_IsDeviceStateOn(ActionState) AS IsOn,
               CASE WHEN TriggeredBy IS NULL OR dbo.fn_IsAutoTrigger(TriggeredBy) = 1
                         OR ExecutedAt < DATEADD(MINUTE, -10, @Now)
                    THEN 1 ELSE 0 END AS AutoAllowed,
               NeedOn, CanOff
        FROM LastAction
    )
    INSERT INTO DeviceActionLogs (RoomID, DeviceType, ActionState, TriggeredBy, Details, ExecutedAt)
    SELECT @RoomID, DeviceType,
           CASE WHEN NeedOn = 1 THEN 'ON' ELSE 'OFF' END,
           N'IOT_AUTO_RULE',
           CONCAT(CASE WHEN NeedOn = 1 THEN N'Tự động bật: ' ELSE N'Tự động tắt: ' END, Reason),
           @Now
    FROM Decision
    WHERE AutoAllowed = 1
      AND ((NeedOn = 1 AND IsOn = 0) OR (CanOff = 1 AND IsOn = 1));

    COMMIT TRANSACTION;

    SELECT @DeviceID AS DeviceID, @RoomID AS RoomID, @DataID AS DataID;
    EXEC dbo.sp_GetRoomDeviceCommands @RoomID = @RoomID;
END
GO

-- ----------------------------------------------------------------------------
-- 7. ĐĂNG KÝ THIẾT BỊ MỚI (Admin) - API key sinh ở backend, chỉ truyền hash vào
-- ----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_RegisterIoTDevice
    @RoomID INT,
    @DeviceName NVARCHAR(100),
    @ApiKeyHash CHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
        THROW 50404, N'ROOM_NOT_FOUND: Buồng nuôi không tồn tại.', 1;

    INSERT INTO IoTDevices (RoomID, DeviceName, ApiKeyHash)
    VALUES (@RoomID, @DeviceName, @ApiKeyHash);

    SELECT * FROM dbo.vw_IoTDeviceStatus WHERE DeviceID = SCOPE_IDENTITY();
END
GO

-- ----------------------------------------------------------------------------
-- 8. THIẾT BỊ DEMO: ESP32 gắn buồng RM03 (ngưỡng CO2 800 ppm, thổi hơi là vượt)
--    API key demo: MC-ESP32-RM03-DEMO  (chỉ dùng môi trường dev/demo,
--    tạo key riêng bằng POST /api/iot/devices khi triển khai thật)
-- ----------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM IoTDevices)
BEGIN
    INSERT INTO IoTDevices (RoomID, DeviceName, ApiKeyHash)
    SELECT RoomID, N'ESP32 buồng RM03 (demo)',
           CONVERT(CHAR(64), HASHBYTES('SHA2_256', 'MC-ESP32-RM03-DEMO'), 2)
    FROM Rooms WHERE RoomCode = 'RM03';
    PRINT N'>>> ĐÃ TẠO THIẾT BỊ DEMO ESP32 CHO RM03 (API key: MC-ESP32-RM03-DEMO) <<<';
END
GO

PRINT N'>>> HOÀN TẤT 06_iot_devices.sql: IoTDevices, vw_IoTDeviceStatus, sp_IngestDeviceReading, sp_GetDeviceCommands <<<';
GO
