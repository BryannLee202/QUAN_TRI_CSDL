-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Database: SmartMushroomDB (Microsoft SQL Server / T-SQL)
-- File: 02_tsql_logic.sql - Stored Procedures, Triggers, Functions & Views
-- ============================================================================

USE SmartMushroomDB;
GO

-- ============================================================================
-- 1. USER-DEFINED FUNCTIONS (UDF)
-- ============================================================================

-- Function 1.1: Tính toán tổng tiền thuê sau khi áp dụng chiết khấu (Scalar Function)
CREATE OR ALTER FUNCTION dbo.fn_CalculateRentalPrice
(
    @PackageID INT,
    @DiscountPercent DECIMAL(5,2) = 0.00
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @BasePrice DECIMAL(18,2) = 0;
    DECLARE @FinalPrice DECIMAL(18,2) = 0;

    SELECT @BasePrice = Price
    FROM RentalPackages
    WHERE PackageID = @PackageID AND IsActive = 1;

    IF @BasePrice IS NULL OR @BasePrice <= 0
        RETURN 0;

    IF @DiscountPercent < 0 OR @DiscountPercent > 100
        SET @DiscountPercent = 0;

    SET @FinalPrice = @BasePrice * (1.00 - (@DiscountPercent / 100.00));
    RETURN ROUND(@FinalPrice, -3); -- Làm tròn đến hàng nghìn đồng
END;
GO

-- Function 1.2: Tính số ngày sinh trưởng hiện tại và % tiến độ của khay nấm (Inline Table-Valued Function)
CREATE OR ALTER FUNCTION dbo.fn_GetTrayProgress
(
    @TrayID INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        t.TrayID,
        t.TrayCode,
        t.Status,
        t.InoculationDate,
        t.ExpectedHarvestDate,
        DATEDIFF(DAY, t.InoculationDate, SYSDATETIME()) AS DaysElapsed,
        DATEDIFF(DAY, SYSDATETIME(), t.ExpectedHarvestDate) AS DaysRemaining,
        CASE 
            WHEN t.InoculationDate IS NULL OR t.ExpectedHarvestDate IS NULL THEN 0
            WHEN SYSDATETIME() >= t.ExpectedHarvestDate THEN 100.00
            WHEN SYSDATETIME() <= t.InoculationDate THEN 0.00
            ELSE CAST(ROUND(
                CAST(DATEDIFF(MINUTE, t.InoculationDate, SYSDATETIME()) AS FLOAT) / 
                NULLIF(DATEDIFF(MINUTE, t.InoculationDate, t.ExpectedHarvestDate), 0) * 100.00, 2) AS DECIMAL(5,2))
        END AS ProgressPercent
    FROM CultivationTrays t
    WHERE t.TrayID = @TrayID
);
GO

-- ============================================================================
-- 2. STORED PROCEDURES NGHIỆP VỤ (TRANSACTIONS & ACID)
-- ============================================================================

-- Procedure 2.1: Tạo đơn thuê khay nấm an toàn (Khóa dòng chống Race Condition)
CREATE OR ALTER PROCEDURE dbo.sp_CreateRentalOrder
    @UserID INT,
    @PackageID INT,
    @TrayID INT,
    @DeliveryAddress NVARCHAR(255),
    @ReceiverPhone VARCHAR(20),
    @PaymentMethod VARCHAR(50) = 'VNPAY',
    @DiscountPercent DECIMAL(5,2) = 0.00,
    @Notes NVARCHAR(500) = NULL,
    @NewOrderID INT OUTPUT,
    @GeneratedOrderCode VARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Tự động rollback nếu xảy ra lỗi nghiêm trọng

    BEGIN TRANSACTION;
    BEGIN TRY
        -- BƯỚC 1: Kiểm tra người dùng có hợp lệ không
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND IsActive = 1)
        BEGIN
            RAISERROR(N'Lỗi: Tài khoản người dùng không tồn tại hoặc đã bị khóa!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- BƯỚC 2: Kiểm tra gói cước có đang hoạt động không
        DECLARE @DurationDays INT, @SpeciesID INT;
        SELECT 
            @DurationDays = DurationDays,
            @SpeciesID = SpeciesID
        FROM RentalPackages 
        WHERE PackageID = @PackageID AND IsActive = 1;

        IF @DurationDays IS NULL
        BEGIN
            RAISERROR(N'Lỗi: Gói thuê nấm không hợp lệ hoặc đã ngừng cung cấp!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- BƯỚC 3: Khóa dòng khay nấm (ROWLOCK, UPDLOCK) để kiểm tra tính sẵn sàng (Chống Overbooking)
        -- Kỹ thuật đỉnh cao giúp ngăn chặn 2 khách hàng bấm thuê 1 khay trong cùng 1 millisecond
        IF NOT EXISTS (
            SELECT 1 
            FROM CultivationTrays WITH (UPDLOCK, ROWLOCK) 
            WHERE TrayID = @TrayID AND Status = 'AVAILABLE'
        )
        BEGIN
            RAISERROR(N'Lỗi: Khay nấm này vừa có người đặt hoặc đang trong quá trình bảo dưỡng!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- BƯỚC 4: Tính toán tổng tiền qua Function
        DECLARE @TotalAmount DECIMAL(18,2);
        SET @TotalAmount = dbo.fn_CalculateRentalPrice(@PackageID, @DiscountPercent);

        -- BƯỚC 5: Tạo mã đơn hàng duy nhất dạng ORD-YYYYMMDD-XXXX
        DECLARE @TodayStr VARCHAR(8) = CONVERT(VARCHAR(8), GETDATE(), 112);
        DECLARE @RandomSuffix VARCHAR(4) = RIGHT('0000' + CAST(ABS(CHECKSUM(NEWID())) % 10000 AS VARCHAR(4)), 4);
        SET @GeneratedOrderCode = 'ORD-' + @TodayStr + '-' + @RandomSuffix;

        -- BƯỚC 6: Tạo hợp đồng thuê trong bảng RentalOrders
        DECLARE @Now DATETIME2(3) = SYSDATETIME();
        DECLARE @ExpectedEnd DATETIME2(3) = DATEADD(DAY, @DurationDays, @Now);

        INSERT INTO RentalOrders 
        (
            OrderCode, UserID, PackageID, StartDate, EndDate, 
            TotalAmount, PaymentStatus, PaymentMethod, DeliveryAddress, 
            ReceiverPhone, Notes, CreatedAt, UpdatedAt
        )
        VALUES 
        (
            @GeneratedOrderCode, @UserID, @PackageID, @Now, @ExpectedEnd,
            @TotalAmount, 'PAID', @PaymentMethod, @DeliveryAddress,
            @ReceiverPhone, @Notes, @Now, @Now
        );

        SET @NewOrderID = SCOPE_IDENTITY();

        -- BƯỚC 7: Cập nhật trạng thái khay nấm sang 'OCCUPIED' và liên kết với mã đơn hàng
        UPDATE CultivationTrays
        SET 
            Status = 'OCCUPIED',
            CurrentOrderID = @NewOrderID,
            InoculationDate = @Now,
            ExpectedHarvestDate = @ExpectedEnd
        WHERE TrayID = @TrayID;

        -- BƯỚC 8: Khởi tạo nhật ký sinh trưởng mốc đầu tiên (Cấy meo nấm)
        INSERT INTO GrowthLogs 
        (
            TrayID, OrderID, StageName, PhotoUrl, Notes, RecordedBy, LogDate
        )
        VALUES 
        (
            @TrayID, @NewOrderID, N'Cấy meo khởi động chu kỳ',
            N'/uploads/growth/default_inoculation.webp',
            N'Khay nấm đã hoàn tất cấy phôi giống vô trùng và bắt đầu quá trình ủ tơ.',
            1, -- Mặc định hệ thống ghi nhận
            @Now
        );

        -- Hoàn tất toàn bộ giao dịch nguyên tử (ACID)
        COMMIT TRANSACTION;
        PRINT N'>>> ĐÃ TẠO THÀNH CÔNG ĐƠN THUÊ KHAY NẤM MÃ: ' + @GeneratedOrderCode;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- Procedure 2.2: Gán khay vật lý qua quét mã QR (Dành cho Kỹ thuật viên)
CREATE OR ALTER PROCEDURE dbo.sp_AssignTrayToOrder
    @OrderID INT,
    @TrayCode VARCHAR(50),
    @OperatorID INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @TrayID INT, @CurrentStatus VARCHAR(20);
        SELECT @TrayID = TrayID, @CurrentStatus = Status
        FROM CultivationTrays WITH (UPDLOCK, ROWLOCK)
        WHERE TrayCode = @TrayCode;

        IF @TrayID IS NULL
        BEGIN
            RAISERROR(N'Lỗi: Mã QR khay nấm không tồn tại trong hệ thống!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @CurrentStatus <> 'AVAILABLE'
        BEGIN
            RAISERROR(N'Lỗi: Khay nấm không ở trạng thái sẵn sàng để gán!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Gán khay vào đơn hàng
        UPDATE CultivationTrays
        SET 
            Status = 'OCCUPIED',
            CurrentOrderID = @OrderID,
            InoculationDate = SYSDATETIME()
        WHERE TrayID = @TrayID;

        COMMIT TRANSACTION;
        PRINT N'>>> ĐÃ GÁN THÀNH CÔNG KHAY ' + @TrayCode + N' CHO ĐƠN HÀNG ID: ' + CAST(@OrderID AS VARCHAR(10));
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Procedure 2.3: Tiếp nhận mẻ dữ liệu cảm biến IoT (Telemetry Ingestion)
CREATE OR ALTER PROCEDURE dbo.sp_InsertSensorData
    @RoomID INT,
    @TrayID INT = NULL,
    @Temperature DECIMAL(5,2),
    @Humidity DECIMAL(5,2),
    @CO2Level DECIMAL(7,2),
    @LightLux DECIMAL(6,1) = NULL,
    @NewDataID BIGINT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra phòng có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
    BEGIN
        RAISERROR(N'Lỗi: Phòng nuôi trồng không hợp lệ!', 16, 1);
        RETURN;
    END

    INSERT INTO SensorData (RoomID, TrayID, Temperature, Humidity, CO2Level, LightLux, RecordedAt)
    VALUES (@RoomID, @TrayID, @Temperature, @Humidity, @CO2Level, @LightLux, SYSDATETIME());

    SET @NewDataID = SCOPE_IDENTITY();
END;
GO

-- Procedure 2.4: Khách hàng gửi yêu cầu thu hoạch khi nấm đến vụ
CREATE OR ALTER PROCEDURE dbo.sp_RequestHarvest
    @OrderID INT,
    @DeliveryType VARCHAR(20) = 'HOME_DELIVERY',
    @DeliveryAddress NVARCHAR(255) = NULL,
    @Notes NVARCHAR(500) = NULL,
    @NewHarvestID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TrayID INT, @OrderCode VARCHAR(30), @DefaultAddress NVARCHAR(255);
    SELECT 
        @OrderCode = o.OrderCode,
        @DefaultAddress = o.DeliveryAddress,
        @TrayID = t.TrayID
    FROM RentalOrders o
    INNER JOIN CultivationTrays t ON t.CurrentOrderID = o.OrderID
    WHERE o.OrderID = @OrderID;

    IF @TrayID IS NULL
    BEGIN
        RAISERROR(N'Lỗi: Đơn hàng không tồn tại hoặc chưa được gán khay nuôi trồng!', 16, 1);
        RETURN;
    END

    IF @DeliveryAddress IS NULL
        SET @DeliveryAddress = @DefaultAddress;

    INSERT INTO HarvestRequests 
    (
        OrderID, TrayID, RequestDate, Status, DeliveryType, DeliveryAddress, Notes
    )
    VALUES 
    (
        @OrderID, @TrayID, SYSDATETIME(), 'REQUESTED', @DeliveryType, @DeliveryAddress, @Notes
    );

    SET @NewHarvestID = SCOPE_IDENTITY();
    PRINT N'>>> ĐÃ GỬI YÊU CẦU THU HOẠCH THÀNH CÔNG CHO ĐƠN ' + @OrderCode;
END;
GO

-- Procedure 2.5: Kỹ thuật viên hoàn tất thu hoạch, nhập sản lượng và chuyển khay sang bảo dưỡng
CREATE OR ALTER PROCEDURE dbo.sp_CompleteHarvest
    @HarvestID INT,
    @ActualWeightKg DECIMAL(5,2),
    @QualityGrade NVARCHAR(20),
    @TrackingNumber VARCHAR(50) = NULL,
    @OperatorID INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @TrayID INT, @OrderID INT;
        SELECT @TrayID = TrayID, @OrderID = OrderID
        FROM HarvestRequests WITH (UPDLOCK, ROWLOCK)
        WHERE HarvestID = @HarvestID;

        IF @TrayID IS NULL
        BEGIN
            RAISERROR(N'Lỗi: Yêu cầu thu hoạch không tồn tại!', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 1. Cập nhật bảng HarvestRequests
        UPDATE HarvestRequests
        SET 
            Status = 'COMPLETED',
            ActualWeightKg = @ActualWeightKg,
            QualityGrade = @QualityGrade,
            TrackingNumber = @TrackingNumber,
            CompletedAt = SYSDATETIME()
        WHERE HarvestID = @HarvestID;

        -- 2. Chuyển trạng thái khay nấm sang 'MAINTENANCE' để vệ sinh khử trùng chuẩn bị đợt mới
        UPDATE CultivationTrays
        SET 
            Status = 'MAINTENANCE',
            CurrentOrderID = NULL,
            LastCleanedAt = SYSDATETIME()
        WHERE TrayID = @TrayID;

        COMMIT TRANSACTION;
        PRINT N'>>> ĐÃ HOÀN TẤT THU HOẠCH KHAY ' + CAST(@TrayID AS VARCHAR(10)) + N' - SẢN LƯỢNG: ' + CAST(@ActualWeightKg AS VARCHAR(10)) + ' kg';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================================
-- 3. DML TRIGGERS (TỰ ĐỘNG HÓA & AUDIT LOGGING)
-- ============================================================================

-- Trigger 3.1: Tự động kiểm tra ngưỡng vi khí hậu khi có dữ liệu cảm biến mới chèn vào
-- Điểm nhấn học thuật lớn: Đẩy toàn bộ logic giám sát IoT xuống tầng Database
CREATE OR ALTER TRIGGER dbo.trg_CheckSensorThresholds
ON dbo.SensorData
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Tự động sinh cảnh báo vào bảng SensorAlerts nếu chỉ số vượt ngưỡng buồng nuôi
    INSERT INTO SensorAlerts (RoomID, TrayID, AlertType, Severity, Message, AlertTime, IsResolved)
    SELECT 
        i.RoomID,
        i.TrayID,
        CASE 
            WHEN i.CO2Level > r.CO2Max THEN 'HIGH_CO2'
            WHEN i.Temperature > r.TempMax THEN 'HIGH_TEMP'
            WHEN i.Temperature < r.TempMin THEN 'LOW_TEMP'
            WHEN i.Humidity > r.HumidityMax THEN 'HIGH_HUMIDITY'
            WHEN i.Humidity < r.HumidityMin THEN 'LOW_HUMIDITY'
            ELSE 'CLIMATE_ANOMALY'
        END AS AlertType,
        CASE 
            WHEN i.CO2Level > r.CO2Max * 1.3 OR i.Temperature > r.TempMax + 4 THEN 'CRITICAL'
            ELSE 'WARNING'
        END AS Severity,
        CONCAT(
            N'Cảnh báo ', r.RoomName, N': ',
            CASE WHEN i.Temperature > r.TempMax THEN CONCAT(N'Nhiệt độ cao (', i.Temperature, N'°C > ', r.TempMax, N'°C). ') ELSE N'' END,
            CASE WHEN i.Temperature < r.TempMin THEN CONCAT(N'Nhiệt độ thấp (', i.Temperature, N'°C < ', r.TempMin, N'°C). ') ELSE N'' END,
            CASE WHEN i.Humidity < r.HumidityMin THEN CONCAT(N'Độ ẩm thiếu (', i.Humidity, N'% < ', r.HumidityMin, N'%). ') ELSE N'' END,
            CASE WHEN i.CO2Level > r.CO2Max THEN CONCAT(N'Khí CO2 ứ đọng (', i.CO2Level, N' ppm > ', r.CO2Max, N' ppm).') ELSE N'' END
        ) AS Message,
        SYSDATETIME(),
        0
    FROM inserted i
    INNER JOIN Rooms r ON i.RoomID = r.RoomID
    WHERE 
        i.Temperature > r.TempMax 
        OR i.Temperature < r.TempMin
        OR i.Humidity > r.HumidityMax 
        OR i.Humidity < r.HumidityMin 
        OR i.CO2Level > r.CO2Max;

    -- Tính năng tự động hóa nâng cao: Nếu CO2 vượt ngưỡng an toàn, Trigger tự ghi lệnh kích hoạt Quạt thông gió
    IF EXISTS (
        SELECT 1 
        FROM inserted i 
        INNER JOIN Rooms r ON i.RoomID = r.RoomID 
        WHERE i.CO2Level > r.CO2Max
    )
    BEGIN
        INSERT INTO DeviceActionLogs (RoomID, DeviceType, ActionState, TriggeredBy, Details, ExecutedAt)
        SELECT 
            i.RoomID,
            'EXHAUST_FAN',
            'AUTO_ON_75%',
            N'T_SQL_TRIGGER_AUTO',
            CONCAT(N'Tự động bật quạt hút do nồng độ CO2 đo được đạt ', i.CO2Level, N' ppm vượt ngưỡng ', r.CO2Max, N' ppm'),
            SYSDATETIME()
        FROM inserted i
        INNER JOIN Rooms r ON i.RoomID = r.RoomID
        WHERE i.CO2Level > r.CO2Max;
    END
END;
GO

-- ============================================================================
-- 4. VIEWS PHỤC VỤ DASHBOARD & BÁO CÁO NHANH
-- ============================================================================

-- View 4.1: Báo cáo tỷ lệ lấp đầy khay nuôi trồng theo từng buồng (Occupancy Report)
CREATE OR ALTER VIEW dbo.vw_RoomOccupancyReport
AS
SELECT 
    r.RoomID,
    r.RoomCode,
    r.RoomName,
    r.MaxTrays,
    COUNT(t.TrayID) AS TotalConfiguredTrays,
    SUM(CASE WHEN t.Status = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableTrays,
    SUM(CASE WHEN t.Status = 'OCCUPIED' THEN 1 ELSE 0 END) AS OccupiedTrays,
    SUM(CASE WHEN t.Status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS MaintenanceTrays,
    CAST(ROUND(
        CAST(SUM(CASE WHEN t.Status = 'OCCUPIED' THEN 1 ELSE 0 END) AS FLOAT) / 
        NULLIF(COUNT(t.TrayID), 0) * 100.00, 2) AS DECIMAL(5,2)) AS OccupancyRatePercent
FROM Rooms r
LEFT JOIN CultivationTrays t ON r.RoomID = t.RoomID
GROUP BY r.RoomID, r.RoomCode, r.RoomName, r.MaxTrays;
GO

-- View 4.2: Tổng hợp dữ liệu hiển thị tức thời cho Cổng Khách Hàng (Customer Dashboard Summary)
CREATE OR ALTER VIEW dbo.vw_CustomerActiveRentals
AS
SELECT 
    o.OrderID,
    o.OrderCode,
    u.UserID,
    u.FullName AS CustomerName,
    u.Email AS CustomerEmail,
    t.TrayID,
    t.TrayCode,
    r.RoomID,
    r.RoomName,
    r.CameraStreamUrl,
    sp.SpeciesID,
    sp.SpeciesName,
    sp.ImageUrl AS SpeciesImageUrl,
    p.PackageName,
    o.StartDate,
    o.EndDate,
    o.TotalAmount,
    o.PaymentStatus,
    prog.DaysElapsed,
    prog.DaysRemaining,
    prog.ProgressPercent,
    -- Thông số vi khí hậu mới nhất của phòng
    latest.Temperature AS CurrentTemp,
    latest.Humidity AS CurrentHumidity,
    latest.CO2Level AS CurrentCO2,
    latest.RecordedAt AS LastSensorSync
FROM RentalOrders o
INNER JOIN Users u ON o.UserID = u.UserID
INNER JOIN RentalPackages p ON o.PackageID = p.PackageID
INNER JOIN MushroomSpecies sp ON p.SpeciesID = sp.SpeciesID
INNER JOIN CultivationTrays t ON t.CurrentOrderID = o.OrderID
INNER JOIN Rooms r ON t.RoomID = r.RoomID
CROSS APPLY dbo.fn_GetTrayProgress(t.TrayID) prog
OUTER APPLY (
    SELECT TOP 1 Temperature, Humidity, CO2Level, RecordedAt
    FROM SensorData
    WHERE RoomID = r.RoomID
    ORDER BY RecordedAt DESC
) latest
WHERE o.PaymentStatus = 'PAID';
GO

-- View 4.3: Báo cáo Doanh thu & Thống kê kinh doanh theo tháng (Monthly Revenue Report)
CREATE OR ALTER VIEW dbo.vw_MonthlyRevenueReport
AS
SELECT 
    YEAR(o.CreatedAt) AS OrderYear,
    MONTH(o.CreatedAt) AS OrderMonth,
    COUNT(o.OrderID) AS TotalOrders,
    SUM(o.TotalAmount) AS TotalRevenue,
    AVG(o.TotalAmount) AS AverageOrderValue,
    COUNT(DISTINCT o.UserID) AS UniqueCustomers
FROM RentalOrders o
WHERE o.PaymentStatus = 'PAID'
GROUP BY YEAR(o.CreatedAt), MONTH(o.CreatedAt);
GO

PRINT N'>>> ĐÃ TẠO THÀNH CÔNG TOÀN BỘ STORED PROCEDURES, TRIGGERS, FUNCTIONS & VIEWS CHO T-SQL! <<<';
GO
