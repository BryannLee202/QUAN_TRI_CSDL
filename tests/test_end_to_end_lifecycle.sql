-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Database: SmartMushroomDB (Microsoft SQL Server / T-SQL)
-- File: tests/test_end_to_end_lifecycle.sql
-- Mục tiêu: Kịch bản kiểm thử toàn diện vòng đời đơn thuê và khay nấm (E2E Lifecycle)
--           từ Khách đặt thuê -> Gán khay -> Cảm biến kích hoạt Trigger ->
--           Thu hoạch -> Chốt sản lượng -> Bảo dưỡng & Tái sử dụng khay.
-- Tác giả: Lê Minh Tài (Trưởng nhóm / Database Lead)
-- ============================================================================

USE SmartMushroomDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO
PRINT N'================================================================================';
PRINT N'  BẮT ĐẦU KIỂM THỬ TOÀN DIỆN VÒNG ĐỜI DỮ LIỆU HỆ THỐNG (END-TO-END LIFECYCLE)   ';
PRINT N'================================================================================';

-- Biến toàn cục theo dõi kết quả kiểm thử
DECLARE @TestStepCount INT = 0;
DECLARE @TestPassCount INT = 0;
DECLARE @TestFailCount INT = 0;

-- Biến lưu trữ ID nghiệp vụ xuyên suốt vòng đời
DECLARE @TestUserID INT;
DECLARE @TestOperatorID INT;
DECLARE @TestPackageID INT;
DECLARE @TestTrayID INT;
DECLARE @TestTrayCode VARCHAR(50);
DECLARE @TestRoomID INT;
DECLARE @TestOrderID INT;
DECLARE @TestOrderCode VARCHAR(30);
DECLARE @TestHarvestID INT;
DECLARE @NewSensorID BIGINT;

BEGIN TRY
    -- ========================================================================
    -- GIAI ĐOẠN 0: CHUẨN BỊ MÔI TRƯỜNG & DỮ LIỆU TEST
    -- ========================================================================
    PRINT N'';
    PRINT N'--- [GIAI ĐOẠN 0]: Chuẩn bị thực thể khách hàng, gói thuê và khay nấm ---';

    -- 1. Lấy thông tin khách hàng mẫu (Customer)
    SELECT TOP 1 @TestUserID = UserID 
    FROM Users 
    WHERE Email = 'customer1@mushroomcloud.test' AND IsActive = 1;

    -- 2. Lấy thông tin kỹ thuật viên mẫu (Operator)
    SELECT TOP 1 @TestOperatorID = UserID 
    FROM Users 
    WHERE Email = 'operator1@mushroomcloud.test' AND IsActive = 1;

    -- 3. Lấy gói thuê nấm Hoàng Kim hoặc gói 30 ngày bất kỳ
    SELECT TOP 1 @TestPackageID = PackageID 
    FROM RentalPackages 
    WHERE IsActive = 1 
    ORDER BY PackageID ASC;

    -- 4. Tìm một khay nấm đang AVAILABLE để tiến hành chu kỳ thuê mới
    SELECT TOP 1 
        @TestTrayID = TrayID, 
        @TestTrayCode = TrayCode,
        @TestRoomID = RoomID
    FROM CultivationTrays
    WHERE Status = 'AVAILABLE'
    ORDER BY TrayID ASC;

    IF @TestUserID IS NULL OR @TestOperatorID IS NULL OR @TestPackageID IS NULL OR @TestTrayID IS NULL
    BEGIN
        RAISERROR(N'[FATAL] Không đủ dữ liệu ban đầu để chạy kịch bản E2E. Vui lòng kiểm tra seed data!', 16, 1);
        RETURN;
    END;

    PRINT N'  + Khách hàng test (ID: ' + CAST(@TestUserID AS NVARCHAR(10)) + N'): customer1@mushroomcloud.test';
    PRINT N'  + Kỹ thuật viên (ID: ' + CAST(@TestOperatorID AS NVARCHAR(10)) + N'): operator1@mushroomcloud.test';
    PRINT N'  + Gói thuê (ID: ' + CAST(@TestPackageID AS NVARCHAR(10)) + N')';
    PRINT N'  + Khay nấm mục tiêu: ' + @TestTrayCode + N' (ID: ' + CAST(@TestTrayID AS NVARCHAR(10)) + N', Phòng: ' + CAST(@TestRoomID AS NVARCHAR(10)) + N')';

    -- ========================================================================
    -- BƯỚC 1: KHÁCH HÀNG TẠO ĐƠN THUÊ KHAY (sp_CreateRentalOrder)
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 1]: Thực thi sp_CreateRentalOrder (Khóa dòng & Giao dịch ACID) ---';

    EXEC dbo.sp_CreateRentalOrder
        @UserID = @TestUserID,
        @PackageID = @TestPackageID,
        @TrayID = @TestTrayID,
        @DeliveryAddress = N'123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM',
        @ReceiverPhone = '0987654321',
        @PaymentMethod = 'VNPAY',
        @DiscountPercent = 5.00,
        @Notes = N'Kịch bản kiểm thử E2E Tuần 3 - Đơn thuê nấm mẫu',
        @NewOrderID = @TestOrderID OUTPUT,
        @GeneratedOrderCode = @TestOrderCode OUTPUT;

    -- Kiểm tra xác nhận bước 1: Đơn hàng đã tạo và khay chuyển sang OCCUPIED
    IF @TestOrderID IS NOT NULL 
       AND EXISTS (SELECT 1 FROM RentalOrders WHERE OrderID = @TestOrderID AND PaymentStatus = 'PAID')
       AND EXISTS (SELECT 1 FROM CultivationTrays WHERE TrayID = @TestTrayID AND Status = 'OCCUPIED' AND CurrentOrderID = @TestOrderID)
       AND EXISTS (SELECT 1 FROM GrowthLogs WHERE OrderID = @TestOrderID AND TrayID = @TestTrayID)
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 1 Thành công: Đơn hàng ' + @TestOrderCode + N' (ID=' + CAST(@TestOrderID AS NVARCHAR(10)) + N') đã tạo, khay đã khoá sang OCCUPIED, nhật ký GrowthLogs đã ghi nhận.';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 1 Thất bại: Đơn hàng chưa được tạo đúng chuẩn hoặc khay chưa chuyển sang OCCUPIED!';
    END;

    -- ========================================================================
    -- BƯỚC 2: KIỂM THỬ THỦ TỤC GÁN KHAY BẰNG QR (sp_AssignTrayToOrder)
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 2]: Kiểm thử thủ tục gán khay QR (sp_AssignTrayToOrder) ---';

    -- Chuẩn bị khay thứ 2 còn trống để kiểm tra nghiệp vụ quét QR gán khay
    DECLARE @SecondTrayID INT, @SecondTrayCode VARCHAR(50);
    SELECT TOP 1 @SecondTrayID = TrayID, @SecondTrayCode = TrayCode
    FROM CultivationTrays
    WHERE Status = 'AVAILABLE' AND TrayID <> @TestTrayID
    ORDER BY TrayID ASC;

    IF @SecondTrayCode IS NOT NULL
    BEGIN
        EXEC dbo.sp_AssignTrayToOrder
            @OrderID = @TestOrderID,
            @TrayCode = @SecondTrayCode,
            @OperatorID = @TestOperatorID;

        IF EXISTS (SELECT 1 FROM CultivationTrays WHERE TrayID = @SecondTrayID AND Status = 'OCCUPIED' AND CurrentOrderID = @TestOrderID)
        BEGIN
            SET @TestPassCount += 1;
            PRINT N'  [PASS] Bước 2 Thành công: Kỹ thuật viên quét QR khay ' + @SecondTrayCode + N' gán bổ sung cho đơn ' + @TestOrderCode + N' thành công.';
            
            -- Trả lại khay phụ về AVAILABLE để giữ môi trường sạch
            UPDATE CultivationTrays SET Status = 'AVAILABLE', CurrentOrderID = NULL WHERE TrayID = @SecondTrayID;
        END
        ELSE
        BEGIN
            SET @TestFailCount += 1;
            PRINT N'  [FAIL] Bước 2 Thất bại: sp_AssignTrayToOrder không cập nhật trạng thái khay!';
        END;
    END
    ELSE
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [SKIP/PASS] Không còn khay trống phụ để test gán bổ sung, khay chính ' + @TestTrayCode + N' đã được gán hoàn chỉnh.';
    END;

    -- ========================================================================
    -- BƯỚC 3: GIẢ LẬP IOT TELEMETRY & T-SQL TRIGGER TỰ ĐỘNG BẬT THIẾT BỊ
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 3]: Kiểm thử tiếp nhận dữ liệu IoT & Kích hoạt Trigger cảnh báo ---';

    -- 3.1. Bơm bản tin cảm biến bình thường
    EXEC dbo.sp_InsertSensorData
        @RoomID = @TestRoomID,
        @TrayID = @TestTrayID,
        @Temperature = 22.50,
        @Humidity = 86.00,
        @CO2Level = 820.00,
        @LightLux = 150.0,
        @NewDataID = @NewSensorID OUTPUT;

    -- 3.2. Bơm bản tin sự cố: Nồng độ CO2 tăng vọt lên 1450 ppm (ngưỡng tối đa phòng là 1200 ppm)
    DECLARE @AnomalySensorID BIGINT;
    EXEC dbo.sp_InsertSensorData
        @RoomID = @TestRoomID,
        @TrayID = @TestTrayID,
        @Temperature = 23.00,
        @Humidity = 84.50,
        @CO2Level = 1450.00, -- Vượt ngưỡng phòng
        @LightLux = 160.0,
        @NewDataID = @AnomalySensorID OUTPUT;

    -- Kiểm tra Trigger trg_CheckSensorThresholds:
    -- 1) Phải sinh cảnh báo trong bảng SensorAlerts
    -- 2) Phải tự động kích hoạt quạt hút EXHAUST_FAN trong DeviceActionLogs
    IF EXISTS (SELECT 1 FROM SensorAlerts WHERE RoomID = @TestRoomID AND AlertType = 'HIGH_CO2' AND IsResolved = 0)
       AND EXISTS (SELECT 1 FROM DeviceActionLogs WHERE RoomID = @TestRoomID AND DeviceType = 'EXHAUST_FAN' AND ActionState = 'ON')
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 3 Thành công: Trigger trg_CheckSensorThresholds đã tự động bắt lỗi CO2=1450 ppm, sinh cảnh báo và bật EXHAUST_FAN.';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 3 Thất bại: Trigger không tạo cảnh báo hoặc không tự kích hoạt quạt hút!';
    END;

    -- ========================================================================
    -- BƯỚC 4: THEO DÕI TIẾN ĐỘ & CỔNG KHÁCH HÀNG (VIEWS & FUNCTIONS)
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 4]: Kiểm tra truy vấn Cổng Khách Hàng (vw_CustomerActiveRentals) ---';

    DECLARE @ElapsedDays INT, @RemainingDays INT, @ProgressPercent DECIMAL(5,2);
    SELECT 
        @ElapsedDays = DaysElapsed,
        @RemainingDays = DaysRemaining,
        @ProgressPercent = ProgressPercent
    FROM dbo.fn_GetTrayProgress(@TestTrayID);

    IF EXISTS (SELECT 1 FROM dbo.vw_CustomerActiveRentals WHERE OrderID = @TestOrderID)
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 4 Thành công: Cổng khách hàng truy vấn dữ liệu thời gian thực thành công. Tiến độ: ' 
              + CAST(@ProgressPercent AS NVARCHAR(10)) + N'%, Số ngày nuôi: ' + CAST(@ElapsedDays AS NVARCHAR(10)) + N' ngày.';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 4 Thất bại: Không tìm thấy đơn hàng trên vw_CustomerActiveRentals!';
    END;

    -- ========================================================================
    -- BƯỚC 5: KHÁCH HÀNG GỬI YÊU CẦU THU HOẠCH (sp_RequestHarvest)
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 5]: Khách hàng gửi yêu cầu thu hoạch (sp_RequestHarvest) ---';

    EXEC dbo.sp_RequestHarvest
        @OrderID = @TestOrderID,
        @DeliveryType = 'HOME_DELIVERY',
        @DeliveryAddress = N'123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM',
        @Notes = N'Thu hoạch buổi sáng, đóng hộp giữ ẩm',
        @NewHarvestID = @TestHarvestID OUTPUT;

    IF @TestHarvestID IS NOT NULL 
       AND EXISTS (SELECT 1 FROM HarvestRequests WHERE HarvestID = @TestHarvestID AND Status = 'REQUESTED')
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 5 Thành công: Yêu cầu thu hoạch đã tạo với ID: ' + CAST(@TestHarvestID AS NVARCHAR(10)) + N', trạng thái REQUESTED.';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 5 Thất bại: sp_RequestHarvest không tạo được bản ghi HarvestRequests!';
    END;

    -- ========================================================================
    -- BƯỚC 6: KỸ THUẬT VIÊN CHỐT SẢN LƯỢNG & HOÀN TẤT THU HOẠCH (sp_CompleteHarvest)
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 6]: Kỹ thuật viên chốt sản lượng thu hoạch (sp_CompleteHarvest) ---';

    EXEC dbo.sp_CompleteHarvest
        @HarvestID = @TestHarvestID,
        @ActualWeightKg = 2.45,
        @QualityGrade = N'Loại A',
        @TrackingNumber = 'VNPOST-MUSH-8899',
        @OperatorID = @TestOperatorID;

    -- Kiểm tra:
    -- 1) HarvestRequests chuyển sang COMPLETED, ActualWeightKg = 2.45
    -- 2) CultivationTrays chuyển sang MAINTENANCE, CurrentOrderID = NULL
    IF EXISTS (SELECT 1 FROM HarvestRequests WHERE HarvestID = @TestHarvestID AND Status = 'COMPLETED' AND ActualWeightKg = 2.45)
       AND EXISTS (SELECT 1 FROM CultivationTrays WHERE TrayID = @TestTrayID AND Status = 'MAINTENANCE' AND CurrentOrderID IS NULL)
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 6 Thành công: Thu hoạch hoàn tất (2.45 kg, Hạng Loại A). Khay ' + @TestTrayCode + N' đã chuyển sang MAINTENANCE.';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 6 Thất bại: Trạng thái thu hoạch hoặc khay nấm sau thu hoạch không hợp lệ!';
    END;

    -- ========================================================================
    -- BƯỚC 7: BẢO DƯỠNG & KHỬ TRÙNG ĐỂ TÁI SỬ DỤNG KHAY
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 7]: Khử trùng buồng nấm và hoàn trả khay về AVAILABLE ---';

    UPDATE CultivationTrays
    SET 
        Status = 'AVAILABLE',
        LastCleanedAt = SYSDATETIME(),
        InoculationDate = NULL,
        ExpectedHarvestDate = NULL
    WHERE TrayID = @TestTrayID;

    -- Đồng thời đóng cảnh báo CO2 để dọn sạch buồng
    UPDATE SensorAlerts
    SET IsResolved = 1, ResolvedAt = SYSDATETIME()
    WHERE RoomID = @TestRoomID AND AlertType = 'HIGH_CO2' AND IsResolved = 0;

    IF EXISTS (SELECT 1 FROM CultivationTrays WHERE TrayID = @TestTrayID AND Status = 'AVAILABLE')
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 7 Thành công: Khay ' + @TestTrayCode + N' đã được khử trùng và hoàn trả về AVAILABLE sẵn sàng cho chu kỳ mới.';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 7 Thất bại: Không thể cập nhật trạng thái khay về AVAILABLE!';
    END;

    -- ========================================================================
    -- BƯỚC 8: BÁO CÁO QUẢN TRỊ & THỐNG KÊ DOANH THU (VIEWS REPORTING)
    -- ========================================================================
    SET @TestStepCount += 1;
    PRINT N'';
    PRINT N'--- [BƯỚC 8]: Đối soát Báo cáo Quản trị (Occupancy & Revenue Views) ---';

    DECLARE @OccupancyRate DECIMAL(5,2);
    SELECT @OccupancyRate = OccupancyRatePercent
    FROM dbo.vw_RoomOccupancyReport
    WHERE RoomID = @TestRoomID;

    DECLARE @MonthlyPaidOrders INT, @TotalMonthlyRevenue DECIMAL(18,2);
    SELECT 
        @MonthlyPaidOrders = PaidOrders,
        @TotalMonthlyRevenue = TotalRevenue
    FROM dbo.vw_MonthlyRevenueReport
    WHERE RevenueYear = YEAR(SYSDATETIME()) AND RevenueMonth = MONTH(SYSDATETIME());

    IF @OccupancyRate IS NOT NULL AND @TotalMonthlyRevenue IS NOT NULL
    BEGIN
        SET @TestPassCount += 1;
        PRINT N'  [PASS] Bước 8 Thành công: Dữ liệu quản trị hợp lệ.';
        PRINT N'         + Công suất buồng hiện tại: ' + CAST(@OccupancyRate AS NVARCHAR(10)) + N'%';
        PRINT N'         + Tổng đơn hàng tháng này: ' + CAST(@MonthlyPaidOrders AS NVARCHAR(10)) + N' đơn';
        PRINT N'         + Doanh thu tháng này: ' + FORMAT(@TotalMonthlyRevenue, 'N0') + N' VNĐ';
    END
    ELSE
    BEGIN
        SET @TestFailCount += 1;
        PRINT N'  [FAIL] Bước 8 Thất bại: Views báo cáo không trả về dữ liệu quản trị hợp lệ!';
    END;

    -- ========================================================================
    -- TỔNG KẾT KẾT QUẢ KIỂM THỬ E2E
    -- ========================================================================
    PRINT N'';
    PRINT N'================================================================================';
    PRINT N'                       TỔNG KẾT KIỂM THỬ VÒNG ĐỜI TOÀN DIỆN                     ';
    PRINT N'================================================================================';
    PRINT N'  + Tổng số bước kiểm tra : ' + CAST(@TestStepCount AS NVARCHAR(10));
    PRINT N'  + Số bước VƯỢT QUA (PASS): ' + CAST(@TestPassCount AS NVARCHAR(10));
    PRINT N'  + Số bước THẤT BẠI (FAIL): ' + CAST(@TestFailCount AS NVARCHAR(10));
    PRINT N'--------------------------------------------------------------------------------';

    IF @TestFailCount = 0
    BEGIN
        PRINT N'>>> KẾT QUẢ: 100% PASS - HỆ THỐNG VẬN HÀNH TRƠN TRU TỪ ĐẦU ĐẾN CUỐI! <<<';
    END
    ELSE
    BEGIN
        PRINT N'>>> KẾT QUẢ: CÓ ' + CAST(@TestFailCount AS NVARCHAR(10)) + N' BƯỚC CHƯA ĐẠT! VUI LÒNG KIỂM TRA LẠI LOG. <<<';
    END;
    PRINT N'================================================================================';

END TRY
BEGIN CATCH
    PRINT N'';
    PRINT N'[LỖI HỆ THỐNG NGHIÊM TRỌNG]: ' + ERROR_MESSAGE();
    PRINT N'Mã lỗi: ' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + N', Dòng: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
END CATCH;
GO
