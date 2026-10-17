-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Database: SmartMushroomDB (Microsoft SQL Server / T-SQL)
-- File: 01_schema.sql - Khởi tạo CSDL, Các Bảng, Khóa Chính/Ngoại & Ràng Buộc (3NF)
-- ============================================================================

-- 1. TẠO CƠ SỞ DỮ LIỆU
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SmartMushroomDB')
BEGIN
    CREATE DATABASE SmartMushroomDB
    COLLATE Vietnamese_CI_AS; -- Hỗ trợ tiếng Việt Unicode không phân biệt hoa thường
END
GO

USE SmartMushroomDB;
GO

-- XÓA BẢNG CŨ THEO THỨ TỰ RÀNG BUỘC (NẾU CẦN TÁI TẠO)
IF OBJECT_ID('DeviceActionLogs', 'U') IS NOT NULL DROP TABLE DeviceActionLogs;
IF OBJECT_ID('HarvestRequests', 'U') IS NOT NULL DROP TABLE HarvestRequests;
IF OBJECT_ID('GrowthLogs', 'U') IS NOT NULL DROP TABLE GrowthLogs;
IF OBJECT_ID('SensorAlerts', 'U') IS NOT NULL DROP TABLE SensorAlerts;
IF OBJECT_ID('SensorData', 'U') IS NOT NULL DROP TABLE SensorData;
IF OBJECT_ID('CultivationTrays', 'U') IS NOT NULL DROP TABLE CultivationTrays;
IF OBJECT_ID('RentalOrders', 'U') IS NOT NULL DROP TABLE RentalOrders;
IF OBJECT_ID('RentalPackages', 'U') IS NOT NULL DROP TABLE RentalPackages;
IF OBJECT_ID('MushroomSpecies', 'U') IS NOT NULL DROP TABLE MushroomSpecies;
IF OBJECT_ID('Rooms', 'U') IS NOT NULL DROP TABLE Rooms;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('Roles', 'U') IS NOT NULL DROP TABLE Roles;
GO

-- ============================================================================
-- 2. BẢNG PHÂN QUYỀN & NGƯỜI DÙNG (AUTHENTICATION & AUTHORIZATION)
-- ============================================================================

-- Bảng Roles (Vai trò người dùng)
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) NOT NULL,
    RoleName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL,
    CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED (RoleID),
    CONSTRAINT UQ_Roles_RoleName UNIQUE (RoleName)
);
GO

-- Bảng Users (Người dùng: Admin, Kỹ thuật viên trang trại, Khách hàng)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) NOT NULL,
    RoleID INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(120) NOT NULL,
    PhoneNumber VARCHAR(20) NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Address NVARCHAR(255) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserID),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);
GO

-- ============================================================================
-- 3. BẢNG BUỒNG NUÔI TRỒNG & GIỐNG NẤM (FARM & SPECIES)
-- ============================================================================

-- Bảng Rooms (Buồng nuôi trồng vật lý kèm thiết lập ngưỡng vi khí hậu)
CREATE TABLE Rooms (
    RoomID INT IDENTITY(1,1) NOT NULL,
    RoomCode VARCHAR(20) NOT NULL,
    RoomName NVARCHAR(100) NOT NULL,
    MaxTrays INT NOT NULL CONSTRAINT DF_Rooms_MaxTrays DEFAULT 50,
    -- Ngưỡng vi khí hậu chuẩn cho buồng nuôi
    TempMin DECIMAL(5,2) NOT NULL CONSTRAINT DF_Rooms_TempMin DEFAULT 20.00,
    TempMax DECIMAL(5,2) NOT NULL CONSTRAINT DF_Rooms_TempMax DEFAULT 28.00,
    HumidityMin DECIMAL(5,2) NOT NULL CONSTRAINT DF_Rooms_HumidityMin DEFAULT 80.00,
    HumidityMax DECIMAL(5,2) NOT NULL CONSTRAINT DF_Rooms_HumidityMax DEFAULT 95.00,
    CO2Max DECIMAL(7,2) NOT NULL CONSTRAINT DF_Rooms_CO2Max DEFAULT 1000.00, -- ppm
    CameraStreamUrl NVARCHAR(500) NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Rooms_IsActive DEFAULT 1,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Rooms_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_Rooms PRIMARY KEY CLUSTERED (RoomID),
    CONSTRAINT UQ_Rooms_RoomCode UNIQUE (RoomCode),
    -- Ràng buộc miền giá trị hợp lệ của cảm biến
    CONSTRAINT CK_Rooms_Temperature CHECK (TempMin >= 0 AND TempMax <= 50 AND TempMin < TempMax),
    CONSTRAINT CK_Rooms_Humidity CHECK (HumidityMin >= 0 AND HumidityMax <= 100 AND HumidityMin < HumidityMax),
    CONSTRAINT CK_Rooms_CO2 CHECK (CO2Max > 0 AND CO2Max <= 5000)
);
GO

-- Bảng MushroomSpecies (Danh mục các loài nấm nuôi trồng)
CREATE TABLE MushroomSpecies (
    SpeciesID INT IDENTITY(1,1) NOT NULL,
    SpeciesName NVARCHAR(100) NOT NULL,
    ScientificName NVARCHAR(150) NULL,
    OptimalTempMin DECIMAL(5,2) NOT NULL,
    OptimalTempMax DECIMAL(5,2) NOT NULL,
    OptimalHumidityMin DECIMAL(5,2) NOT NULL,
    OptimalHumidityMax DECIMAL(5,2) NOT NULL,
    OptimalCO2Max DECIMAL(7,2) NOT NULL,
    GrowthDurationDays INT NOT NULL, -- Thời gian 1 chu kỳ từ cấy phôi đến thu hoạch
    EstimatedYieldKgPerTray DECIMAL(5,2) NOT NULL CONSTRAINT DF_Species_Yield DEFAULT 1.50,
    Description NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Species_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_MushroomSpecies PRIMARY KEY CLUSTERED (SpeciesID),
    CONSTRAINT UQ_MushroomSpecies_Name UNIQUE (SpeciesName)
);
GO

-- ============================================================================
-- 4. BẢNG GÓI THUÊ & HỢP ĐỒNG ĐƠN HÀNG (RENTAL SERVICES & CONTRACTS)
-- ============================================================================

-- Bảng RentalPackages (Gói dịch vụ thuê khay nấm trọn gói - FaaS)
CREATE TABLE RentalPackages (
    PackageID INT IDENTITY(1,1) NOT NULL,
    SpeciesID INT NOT NULL,
    PackageName NVARCHAR(150) NOT NULL,
    DurationDays INT NOT NULL, -- Số ngày thuê (30, 60, 90 ngày)
    Price DECIMAL(18,2) NOT NULL, -- Giá thuê trọn gói (VNĐ)
    ExpectedYieldKg DECIMAL(5,2) NOT NULL, -- Sản lượng nấm cam kết thu hoạch (kg)
    Description NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Packages_IsActive DEFAULT 1,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Packages_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_RentalPackages PRIMARY KEY CLUSTERED (PackageID),
    CONSTRAINT FK_RentalPackages_Species FOREIGN KEY (SpeciesID) REFERENCES MushroomSpecies(SpeciesID),
    CONSTRAINT CK_RentalPackages_Price CHECK (Price >= 0),
    CONSTRAINT CK_RentalPackages_Duration CHECK (DurationDays > 0)
);
GO

-- Bảng RentalOrders (Hợp đồng thuê khay điện tử)
CREATE TABLE RentalOrders (
    OrderID INT IDENTITY(1,1) NOT NULL,
    OrderCode VARCHAR(30) NOT NULL,
    UserID INT NOT NULL,
    PackageID INT NOT NULL,
    StartDate DATETIME2(3) NOT NULL,
    EndDate DATETIME2(3) NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL CONSTRAINT DF_Orders_PaymentStatus DEFAULT 'PENDING',
    PaymentMethod VARCHAR(50) NULL, -- 'VNPAY', 'MOMO', 'BANK_TRANSFER'
    TransactionRef VARCHAR(100) NULL, -- Mã giao dịch ngân hàng / cổng thanh toán
    DeliveryAddress NVARCHAR(255) NOT NULL,
    ReceiverPhone VARCHAR(20) NOT NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Orders_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_RentalOrders PRIMARY KEY CLUSTERED (OrderID),
    CONSTRAINT UQ_RentalOrders_Code UNIQUE (OrderCode),
    CONSTRAINT FK_RentalOrders_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_RentalOrders_Packages FOREIGN KEY (PackageID) REFERENCES RentalPackages(PackageID),
    CONSTRAINT CK_RentalOrders_PaymentStatus CHECK (PaymentStatus IN ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')),
    CONSTRAINT CK_RentalOrders_Date CHECK (EndDate > StartDate)
);
GO

-- ============================================================================
-- 5. BẢNG KHAY NUÔI TRỒNG VẬT LÝ & GÁN MÃ QR (CULTIVATION TRAYS)
-- ============================================================================

-- Bảng CultivationTrays (Khay nấm vật lý có gắn mã định danh QR Code duy nhất)
CREATE TABLE CultivationTrays (
    TrayID INT IDENTITY(1,1) NOT NULL,
    TrayCode VARCHAR(50) NOT NULL, -- Mã QR dán trên thành khay, ví dụ: 'TRAY-RM01-R02-015'
    RoomID INT NOT NULL,
    RackNumber INT NOT NULL, -- Số kệ
    ShelfLevel INT NOT NULL, -- Tầng kệ (1 -> 5)
    PositionNumber INT NOT NULL, -- Vị trí trên tầng
    Status VARCHAR(20) NOT NULL CONSTRAINT DF_Trays_Status DEFAULT 'AVAILABLE',
    CurrentOrderID INT NULL, -- Hợp đồng đang thuê khay này (NULL nếu khay đang trống)
    InoculationDate DATETIME2(3) NULL, -- Ngày cấy meo nấm
    ExpectedHarvestDate DATETIME2(3) NULL, -- Ngày dự kiến nấm chín
    LastCleanedAt DATETIME2(3) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Trays_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_CultivationTrays PRIMARY KEY CLUSTERED (TrayID),
    CONSTRAINT UQ_CultivationTrays_Code UNIQUE (TrayCode),
    CONSTRAINT FK_CultivationTrays_Rooms FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    CONSTRAINT FK_CultivationTrays_Orders FOREIGN KEY (CurrentOrderID) REFERENCES RentalOrders(OrderID),
    CONSTRAINT CK_CultivationTrays_Status CHECK (Status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'))
);
GO

-- ============================================================================
-- 6. BẢNG TIME-SERIES IOT SENSOR & CẢNH BÁO VI KHÍ HẬU (TELEMETRY & ALERTS)
-- ============================================================================

-- Bảng SensorData (Lịch sử dữ liệu vi khí hậu thu thập từ IoT cảm biến - Dữ liệu chuỗi thời gian)
CREATE TABLE SensorData (
    DataID BIGINT IDENTITY(1,1) NOT NULL,
    RoomID INT NOT NULL,
    TrayID INT NULL, -- Có thể đo chung theo phòng hoặc đo riêng từng khay nếu gắn node
    Temperature DECIMAL(5,2) NOT NULL, -- °C
    Humidity DECIMAL(5,2) NOT NULL,    -- %
    CO2Level DECIMAL(7,2) NOT NULL,    -- ppm
    LightLux DECIMAL(6,1) NULL,        -- Lux
    RecordedAt DATETIME2(3) NOT NULL CONSTRAINT DF_SensorData_RecordedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_SensorData PRIMARY KEY CLUSTERED (DataID),
    CONSTRAINT FK_SensorData_Rooms FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    CONSTRAINT FK_SensorData_Trays FOREIGN KEY (TrayID) REFERENCES CultivationTrays(TrayID),
    CONSTRAINT CK_SensorData_Temp CHECK (Temperature BETWEEN -10.00 AND 60.00),
    CONSTRAINT CK_SensorData_Humidity CHECK (Humidity BETWEEN 0.00 AND 100.00),
    CONSTRAINT CK_SensorData_CO2 CHECK (CO2Level >= 0.00)
);
GO

-- Bảng SensorAlerts (Lưu trữ các cảnh báo vi khí hậu tự động sinh ra bởi TRIGGER T-SQL)
CREATE TABLE SensorAlerts (
    AlertID INT IDENTITY(1,1) NOT NULL,
    RoomID INT NOT NULL,
    TrayID INT NULL,
    AlertType VARCHAR(50) NOT NULL, -- 'HIGH_TEMP', 'LOW_HUMIDITY', 'HIGH_CO2', 'CRITICAL_CLIMATE'
    Severity VARCHAR(20) NOT NULL CONSTRAINT DF_Alerts_Severity DEFAULT 'WARNING', -- 'INFO', 'WARNING', 'CRITICAL'
    Message NVARCHAR(500) NOT NULL,
    AlertTime DATETIME2(3) NOT NULL CONSTRAINT DF_Alerts_AlertTime DEFAULT SYSDATETIME(),
    IsResolved BIT NOT NULL CONSTRAINT DF_Alerts_IsResolved DEFAULT 0,
    ResolvedAt DATETIME2(3) NULL,
    ResolvedNotes NVARCHAR(255) NULL,
    CONSTRAINT PK_SensorAlerts PRIMARY KEY CLUSTERED (AlertID),
    CONSTRAINT FK_SensorAlerts_Rooms FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    CONSTRAINT FK_SensorAlerts_Trays FOREIGN KEY (TrayID) REFERENCES CultivationTrays(TrayID),
    CONSTRAINT CK_SensorAlerts_Severity CHECK (Severity IN ('INFO', 'WARNING', 'CRITICAL'))
);
GO

-- ============================================================================
-- 7. BẢNG NHẬT KÝ SINH TRƯỞNG & YÊU CẦU THU HOẠCH (GROWTH & HARVEST)
-- ============================================================================

-- Bảng GrowthLogs (Nhật ký sinh trưởng kèm hình ảnh để khách hàng theo dõi tiến độ)
CREATE TABLE GrowthLogs (
    LogID INT IDENTITY(1,1) NOT NULL,
    TrayID INT NOT NULL,
    OrderID INT NOT NULL,
    StageName NVARCHAR(50) NOT NULL, -- 'Cấy meo', 'Ủ tơ nấm', 'Kích ẩm ra nụ', 'Phát triển quả thể', 'Sắp thu hoạch'
    PhotoUrl NVARCHAR(500) NOT NULL,
    HeightMm DECIMAL(5,1) NULL, -- Kích thước nấm đo được (mm)
    Notes NVARCHAR(MAX) NULL,
    RecordedBy INT NOT NULL, -- Nhân viên kỹ thuật chụp ảnh ghi nhận
    LogDate DATETIME2(3) NOT NULL CONSTRAINT DF_GrowthLogs_LogDate DEFAULT SYSDATETIME(),
    CONSTRAINT PK_GrowthLogs PRIMARY KEY CLUSTERED (LogID),
    CONSTRAINT FK_GrowthLogs_Trays FOREIGN KEY (TrayID) REFERENCES CultivationTrays(TrayID),
    CONSTRAINT FK_GrowthLogs_Orders FOREIGN KEY (OrderID) REFERENCES RentalOrders(OrderID),
    CONSTRAINT FK_GrowthLogs_Users FOREIGN KEY (RecordedBy) REFERENCES Users(UserID)
);
GO

-- Bảng HarvestRequests (Yêu cầu thu hoạch và đóng gói giao nấm tận nhà cho khách)
CREATE TABLE HarvestRequests (
    HarvestID INT IDENTITY(1,1) NOT NULL,
    OrderID INT NOT NULL,
    TrayID INT NOT NULL,
    RequestDate DATETIME2(3) NOT NULL CONSTRAINT DF_Harvest_RequestDate DEFAULT SYSDATETIME(),
    Status VARCHAR(30) NOT NULL CONSTRAINT DF_Harvest_Status DEFAULT 'REQUESTED',
    DeliveryType VARCHAR(20) NOT NULL CONSTRAINT DF_Harvest_DeliveryType DEFAULT 'HOME_DELIVERY', -- 'HOME_DELIVERY' hoặc 'PICKUP_AT_FARM'
    ActualWeightKg DECIMAL(5,2) NULL, -- Khối lượng thực tế thu hái (kg)
    QualityGrade NVARCHAR(20) NULL, -- 'Loại 1 (Xuất khẩu)', 'Loại 2', 'Nấm sấy'
    DeliveryAddress NVARCHAR(255) NULL,
    TrackingNumber VARCHAR(50) NULL, -- Mã vận đơn bưu cục giao hàng (GHTK / ViettelPost)
    CompletedAt DATETIME2(3) NULL,
    Notes NVARCHAR(500) NULL,
    CONSTRAINT PK_HarvestRequests PRIMARY KEY CLUSTERED (HarvestID),
    CONSTRAINT FK_HarvestRequests_Orders FOREIGN KEY (OrderID) REFERENCES RentalOrders(OrderID),
    CONSTRAINT FK_HarvestRequests_Trays FOREIGN KEY (TrayID) REFERENCES CultivationTrays(TrayID),
    CONSTRAINT CK_Harvest_Status CHECK (Status IN ('REQUESTED', 'HARVESTING', 'READY_FOR_DELIVERY', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT CK_Harvest_DeliveryType CHECK (DeliveryType IN ('HOME_DELIVERY', 'PICKUP_AT_FARM'))
);
GO

-- Bảng DeviceActionLogs (Nhật ký điều khiển thiết bị IoT buồng nấm)
CREATE TABLE DeviceActionLogs (
    ActionID INT IDENTITY(1,1) NOT NULL,
    RoomID INT NOT NULL,
    DeviceType VARCHAR(50) NOT NULL, -- 'MISTING_SYSTEM', 'EXHAUST_FAN', 'TEMP_CHILLER', 'GROW_LIGHT'
    ActionState VARCHAR(20) NOT NULL, -- 'ON', 'OFF', 'SPEED_70', 'AUTO'
    TriggeredBy NVARCHAR(100) NOT NULL, -- 'OPERATOR_MANUAL', 'T_SQL_TRIGGER_AUTO', 'SCHEDULED_CRON'
    Details NVARCHAR(500) NULL,
    ExecutedAt DATETIME2(3) NOT NULL CONSTRAINT DF_DeviceLogs_ExecutedAt DEFAULT SYSDATETIME(),
    CONSTRAINT PK_DeviceActionLogs PRIMARY KEY CLUSTERED (ActionID),
    CONSTRAINT FK_DeviceActionLogs_Rooms FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);
GO

PRINT N'>>> ĐÃ TẠO THÀNH CÔNG TOÀN BỘ CƠ SỞ DỮ LIỆU & RÀNG BUỘC CHO SMARTMUSHROOMDB! <<<';
GO
