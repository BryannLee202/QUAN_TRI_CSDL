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

PRINT N'>>> HOÀN TẤT 06_iot_devices.sql: IoTDevices, vw_IoTDeviceStatus, sp_GetRoomDeviceCommands, sp_GetDeviceCommands <<<';
GO
