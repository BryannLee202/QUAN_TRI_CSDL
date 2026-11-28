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

-- ----------------------------------------------------------------------------
-- 2. VIEW TRẠNG THÁI THIẾT BỊ (online nếu liên lạc trong 60 giây gần nhất)
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

PRINT N'>>> HOÀN TẤT 06_iot_devices.sql: IoTDevices, vw_IoTDeviceStatus <<<';
GO
