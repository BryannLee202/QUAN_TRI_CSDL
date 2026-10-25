-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU - MUSHROOMCLOUD
-- BÀI KIỂM THỬ QUY TRÌNH GÁN KHAY QR VÀ THU HOẠCH NẤM (HARVEST & QR LIFECYCLE)
-- Phụ trách: Lê Minh Tài (Trưởng nhóm - Lead Architect)
-- Các thủ tục kiểm chứng: sp_AssignTrayToOrder, sp_RequestHarvest, sp_CompleteHarvest
-- ============================================================================

USE SmartMushroomDB;
SET NOCOUNT ON;

PRINT N'============================================================================';
PRINT N'BẮT ĐẦU KIỂM THỬ QUY TRÌNH GÁN KHAY QR VÀ THU HOẠCH (HARVEST LIFECYCLE)';
PRINT N'============================================================================';

DECLARE @TestRoomID INT, @TestPackageID INT, @TestUserID INT, @TestOperatorID INT;
DECLARE @TestTrayID INT, @TestOrderID INT, @TestOrderCode VARCHAR(30);
DECLARE @TestHarvestID INT;
DECLARE @PassCount INT = 0, @FailCount INT = 0;

-- 1. CHUẨN BỊ MÔI TRƯỜNG DỮ LIỆU CÔ LẬP
DELETE FROM CultivationTrays WHERE TrayCode = 'TRAY_TEST_QR_01';
DELETE FROM Rooms WHERE RoomCode = 'RM_TEST_QR';

INSERT INTO Rooms (RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max, IsActive)
VALUES ('RM_TEST_QR', N'Phòng Test Quy Trình QR', 5, 20.0, 26.0, 85.0, 95.0, 900.0, 1);
SET @TestRoomID = SCOPE_IDENTITY();

INSERT INTO CultivationTrays (RoomID, TrayCode, Status, CurrentOrderID)
VALUES (@TestRoomID, 'TRAY_TEST_QR_01', 'AVAILABLE', NULL);
SET @TestTrayID = SCOPE_IDENTITY();

SELECT TOP 1 @TestPackageID = PackageID FROM RentalPackages WHERE IsActive = 1;
SELECT TOP 1 @TestUserID = UserID FROM Users WHERE RoleID = 3;
SELECT TOP 1 @TestOperatorID = UserID FROM Users WHERE RoleID = 2; -- Kỹ thuật viên

-- Tạo đơn thuê nấm ban đầu chưa gán khay
INSERT INTO RentalOrders (OrderCode, UserID, PackageID, StartDate, ExpectedEndDate, TotalAmount, PaymentStatus, PaymentMethod, DeliveryAddress, ReceiverPhone)
VALUES ('ORD-TEST-QR-999', @TestUserID, @TestPackageID, SYSDATETIME(), DATEADD(DAY, 45, SYSDATETIME()), 1500000, 'PAID', 'MOMO', N'Địa chỉ nhận nấm test', '0909999888');
SET @TestOrderID = SCOPE_IDENTITY();

PRINT N'>> [CHUẨN BỊ]: Đã tạo đơn hàng test ORD-TEST-QR-999 (ID: ' + CAST(@TestOrderID AS VARCHAR(10)) + N') và khay TRAY_TEST_QR_01 (AVAILABLE).';
PRINT N'';

-- ============================================================================
-- TEST CASE 1: KỸ THUẬT VIÊN QUÉT MÃ QR GÁN KHAY HỢP LỆ (HAPPY PATH)
-- ============================================================================
PRINT N'>> TEST 1: Kỹ thuật viên quét mã QR TRAY_TEST_QR_01 gán vào đơn hàng...';
BEGIN TRY
    EXEC dbo.sp_AssignTrayToOrder
        @OrderID = @TestOrderID,
        @TrayCode = 'TRAY_TEST_QR_01',
        @OperatorID = @TestOperatorID;

    -- Kiểm tra trạng thái khay đã đổi sang OCCUPIED và liên kết đúng OrderID chưa
    IF EXISTS (SELECT 1 FROM CultivationTrays WHERE TrayCode = 'TRAY_TEST_QR_01' AND Status = 'OCCUPIED' AND CurrentOrderID = @TestOrderID)
    BEGIN
        PRINT N'   [PASS] Gán khay QR thành công! Khay đã chuyển sang OCCUPIED và liên kết đúng đơn hàng.';
        SET @PassCount += 1;
    END
    ELSE
    BEGIN
        PRINT N'   [FAIL] Trạng thái khay không cập nhật chính xác!';
        SET @FailCount += 1;
    END
END TRY
BEGIN CATCH
    PRINT N'   [FAIL] Lỗi không mong muốn: ' + ERROR_MESSAGE();
    SET @FailCount += 1;
END CATCH;

-- ============================================================================
-- TEST CASE 2: TỪ CHỐI GÁN ĐÈ LÊN KHAY ĐÃ CÓ NGƯỜI THUÊ (NEGATIVE TEST)
-- ============================================================================
PRINT N'';
PRINT N'>> TEST 2: Thử gán đè mã QR TRAY_TEST_QR_01 (đang OCCUPIED) cho đơn hàng khác...';
BEGIN TRY
    EXEC dbo.sp_AssignTrayToOrder
        @OrderID = 99999,
        @TrayCode = 'TRAY_TEST_QR_01',
        @OperatorID = @TestOperatorID;

    PRINT N'   [FAIL] Nguy hiểm! Hệ thống cho phép gán đè khay đang nuôi trồng!';
    SET @FailCount += 1;
END TRY
BEGIN CATCH
    PRINT N'   [PASS] Bị chặn đứng an toàn: ' + ERROR_MESSAGE();
    SET @PassCount += 1;
END CATCH;

-- ============================================================================
-- TEST CASE 3: KHÁCH HÀNG GỬI YÊU CẦU THU HOẠCH (sp_RequestHarvest)
-- ============================================================================
PRINT N'';
PRINT N'>> TEST 3: Khách hàng gửi yêu cầu thu hoạch nấm khi đến kỳ vụ...';
BEGIN TRY
    EXEC dbo.sp_RequestHarvest
        @OrderID = @TestOrderID,
        @DeliveryType = 'HOME_DELIVERY',
        @DeliveryAddress = N'Căn hộ 12A, Tòa Landmark 81, TP.HCM',
        @Notes = N'Yêu cầu giao nấm tươi trước 10h sáng',
        @NewHarvestID = @TestHarvestID OUTPUT;

    IF @TestHarvestID IS NOT NULL AND EXISTS (SELECT 1 FROM HarvestRequests WHERE HarvestID = @TestHarvestID AND Status = 'REQUESTED')
    BEGIN
        PRINT N'   [PASS] Tạo yêu cầu thu hoạch thành công! Mã yêu cầu: ' + CAST(@TestHarvestID AS VARCHAR(10));
        SET @PassCount += 1;
    END
    ELSE
    BEGIN
        PRINT N'   [FAIL] Không tạo được bản ghi HarvestRequests!';
        SET @FailCount += 1;
    END
END TRY
BEGIN CATCH
    PRINT N'   [FAIL] Lỗi: ' + ERROR_MESSAGE();
    SET @FailCount += 1;
END CATCH;

-- ============================================================================
-- TEST CASE 4: KỸ THUẬT VIÊN NGHIỆM THU VÀ HOÀN TẤT VỤ (sp_CompleteHarvest)
-- ============================================================================
PRINT N'';
PRINT N'>> TEST 4: Kỹ thuật viên nghiệm thu sản lượng 3.25 kg, nấm Hạng A, hoàn tất vụ...';
BEGIN TRY
    EXEC dbo.sp_CompleteHarvest
        @HarvestID = @TestHarvestID,
        @ActualWeightKg = 3.25,
        @QualityGrade = N'Hạng A (Xuất Sắc)',
        @TrackingNumber = 'VNPOST-MSCLOUD-888999',
        @OperatorID = @TestOperatorID;

    -- Kiểm tra:
    -- 1. HarvestRequests đổi sang COMPLETED
    -- 2. RentalOrders đổi sang COMPLETED
    -- 3. CultivationTrays chuyển về MAINTENANCE (để khử trùng) và gỡ liên kết đơn hàng
    DECLARE @HarvestStatus VARCHAR(20), @OrderStatus VARCHAR(20), @TrayStatus VARCHAR(20), @CurrOrder INT;
    SELECT @HarvestStatus = Status FROM HarvestRequests WHERE HarvestID = @TestHarvestID;
    SELECT @OrderStatus = OrderStatus FROM RentalOrders WHERE OrderID = @TestOrderID;
    SELECT @TrayStatus = Status, @CurrOrder = CurrentOrderID FROM CultivationTrays WHERE TrayID = @TestTrayID;

    IF @HarvestStatus = 'COMPLETED' AND @OrderStatus = 'COMPLETED' AND @TrayStatus = 'MAINTENANCE' AND @CurrOrder IS NULL
    BEGIN
        PRINT N'   [PASS] Nghiệm thu toàn vẹn thành công!';
        PRINT N'          - Trạng thái yêu cầu: ' + @HarvestStatus;
        PRINT N'          - Trạng thái đơn hàng: ' + @OrderStatus;
        PRINT N'          - Trạng thái khay nấm: ' + @TrayStatus + N' (sẵn sàng khử trùng vụ mới)';
        SET @PassCount += 1;
    END
    ELSE
    BEGIN
        PRINT N'   [FAIL] Dữ liệu sau thu hoạch không đúng kỳ vọng: Harvest=' + ISNULL(@HarvestStatus,'') + N', Order=' + ISNULL(@OrderStatus,'') + N', Tray=' + ISNULL(@TrayStatus,'');
        SET @FailCount += 1;
    END
END TRY
BEGIN CATCH
    PRINT N'   [FAIL] Lỗi nghiệm thu: ' + ERROR_MESSAGE();
    SET @FailCount += 1;
END CATCH;

-- ============================================================================
-- TỔNG KẾT
-- ============================================================================
PRINT N'';
PRINT N'============================================================================';
PRINT N'TỔNG KẾT BÀI TEST VÒNG ĐỜI GÁN KHAY & THU HOẠCH:';
PRINT N'- Số bài ĐẠT (PASS): ' + CAST(@PassCount AS VARCHAR(5)) + ' / 4';
PRINT N'- Số bài LỖI (FAIL): ' + CAST(@FailCount AS VARCHAR(5));
IF @FailCount = 0
    PRINT N'>>> KẾT QUẢ: 100% STORED PROCEDURES VẬN HÀNH CHUẨN XÁC, AN TOÀN ACID! <<<';
PRINT N'============================================================================';

-- DỌN DẸP DỮ LIỆU TEST
IF @TestHarvestID IS NOT NULL DELETE FROM HarvestRequests WHERE HarvestID = @TestHarvestID;
DELETE FROM CultivationTrays WHERE TrayCode = 'TRAY_TEST_QR_01';
DELETE FROM RentalOrders WHERE OrderID = @TestOrderID;
DELETE FROM Rooms WHERE RoomCode = 'RM_TEST_QR';
GO
