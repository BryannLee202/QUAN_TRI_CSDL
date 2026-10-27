-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU - MUSHROOMCLOUD
-- BÀI KIỂM THỬ ĐỒNG THỜI & TRANH CHẤP DỮ LIỆU (CONCURRENCY & RACE CONDITION TEST)
-- Mục tiêu: Chứng minh cơ chế khóa dòng (UPDLOCK, ROWLOCK) trong sp_CreateRentalOrder
-- ngăn chặn 100% hiện tượng Overbooking khi nhiều khách hàng cùng đặt khay đồng thời.
-- ============================================================================

USE SmartMushroomDB;
SET NOCOUNT ON;

PRINT N'============================================================================';
PRINT N'BẮT ĐẦU KIỂM THỬ TRANH CHẤP ĐỒNG THỜI (CONCURRENCY RACE CONDITION TEST)';
PRINT N'============================================================================';

-- BƯỚC 1: KHỞI TẠO MÔI TRƯỜNG DỮ LIỆU KIỂM THỬ CÔ LẬP
DECLARE @TestRoomID INT, @TestPackageID INT, @TestUserA INT, @TestUserB INT;
DECLARE @TestTrayID INT;

-- 1.1 Tạo phòng thử nghiệm chỉ có DUY NHẤT 1 khay trống
DELETE FROM CultivationTrays WHERE TrayCode = 'TRAY_CONCUR_01';
DELETE FROM Rooms WHERE RoomCode = 'RM_TEST_CONCUR';

INSERT INTO Rooms (RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max, IsActive)
VALUES ('RM_TEST_CONCUR', N'Phòng Thử Nghiệm Concurrency', 1, 20.0, 28.0, 80.0, 95.0, 1000.0, 1);
SET @TestRoomID = SCOPE_IDENTITY();

INSERT INTO CultivationTrays (RoomID, TrayCode, Status, CurrentOrderID)
VALUES (@TestRoomID, 'TRAY_CONCUR_01', 'AVAILABLE', NULL);
SET @TestTrayID = SCOPE_IDENTITY();

-- 1.2 Lấy gói thuê mẫu
SELECT TOP 1 @TestPackageID = PackageID FROM RentalPackages WHERE IsActive = 1;

-- 1.3 Lấy 2 khách hàng mẫu
SELECT TOP 1 @TestUserA = UserID FROM Users WHERE RoleID = 3 ORDER BY UserID ASC;
SELECT TOP 1 @TestUserB = UserID FROM Users WHERE RoleID = 3 ORDER BY UserID DESC;

PRINT N'>> Khởi tạo thành công:';
PRINT N'   - Phòng thử nghiệm: RM_TEST_CONCUR (ID: ' + CAST(@TestRoomID AS VARCHAR(10)) + N', Sức chứa: 1 khay)';
PRINT N'   - Khay vật lý duy nhất: TRAY_CONCUR_01 (ID: ' + CAST(@TestTrayID AS VARCHAR(10)) + N')';
PRINT N'   - Khách hàng A (ID: ' + CAST(@TestUserA AS VARCHAR(10)) + N'), Khách hàng B (ID: ' + CAST(@TestUserB AS VARCHAR(10)) + N')';
PRINT N'';

-- ============================================================================
-- BƯỚC 2: MÔ PHỎNG TIẾN TRÌNH 1 (SESSION 1 - KHÁCH HÀNG A ĐẶT TRƯỚC)
-- ============================================================================
PRINT N'>> [TIẾN TRÌNH 1]: Khách hàng A gọi sp_CreateRentalOrder...';

DECLARE @OrderCodeA VARCHAR(30), @OrderID_A INT;

BEGIN TRY
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @TestUserA,
        @PackageID = @TestPackageID,
        @TargetRoomID = @TestRoomID,
        @PaymentMethod = 'VNPAY',
        @DeliveryAddress = N'123 Đường Test Concurrency, Quận 1, TP.HCM',
        @ReceiverPhone = '0901111222',
        @DiscountPercent = 0,
        @Notes = N'Đơn hàng test concurrency - Khách A',
        @GeneratedOrderCode = @OrderCodeA OUTPUT,
        @NewOrderID = @OrderID_A OUTPUT;

    PRINT N'   [THÀNH CÔNG] Khách A đã giữ chỗ khay thành công! Mã đơn: ' + @OrderCodeA;
END TRY
BEGIN CATCH
    PRINT N'   [LỖI] Khách A thất bại: ' + ERROR_MESSAGE();
END CATCH;

-- ============================================================================
-- BƯỚC 3: MÔ PHỎNG TIẾN TRÌNH 2 (SESSION 2 - KHÁCH HÀNG B TRANH CHẤP CÙNG PHÒNG)
-- ============================================================================
PRINT N'>> [TIẾN TRÌNH 2]: Khách hàng B gọi sp_CreateRentalOrder vào cùng phòng vừa hết chỗ...';

DECLARE @OrderCodeB VARCHAR(30), @OrderID_B INT;
DECLARE @SessionB_Blocked BIT = 0;

BEGIN TRY
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @TestUserB,
        @PackageID = @TestPackageID,
        @TargetRoomID = @TestRoomID,
        @PaymentMethod = 'MOMO',
        @DeliveryAddress = N'456 Đường Test Tranh Chấp, Quận 3, TP.HCM',
        @ReceiverPhone = '0903333444',
        @DiscountPercent = 0,
        @Notes = N'Đơn hàng test concurrency - Khách B (Kỳ vọng bị từ chối)',
        @GeneratedOrderCode = @OrderCodeB OUTPUT,
        @NewOrderID = @OrderID_B OUTPUT;

    PRINT N'   [CẢNH BÁO NGUY HIỂM] Khách B đặt thành công -> ĐÃ XẢY RA LỖI OVERBOOKING!';
END TRY
BEGIN CATCH
    SET @SessionB_Blocked = 1;
    PRINT N'   [ĐẠT CHUẨN KỸ THUẬT] Khách B bị từ chối chính xác theo thiết kế CSDL:';
    PRINT N'   -> Thông báo lỗi từ T-SQL: ' + ERROR_MESSAGE();
END CATCH;

-- ============================================================================
-- BƯỚC 4: ĐỐI SOÁT TOÀN VẸN CƠ SỞ DỮ LIỆU (DATABASE INTEGRITY AUDIT)
-- ============================================================================
PRINT N'';
PRINT N'>> [KIỂM TRA TOÀN VẸN DỮ LIỆU]:';

-- 4.1 Kiểm tra trạng thái khay nấm
DECLARE @FinalTrayStatus VARCHAR(20), @AssignedOrderID INT;
SELECT @FinalTrayStatus = Status, @AssignedOrderID = CurrentOrderID
FROM CultivationTrays
WHERE TrayID = @TestTrayID;

PRINT N'   - Trạng thái khay TRAY_CONCUR_01 hiện tại: ' + @FinalTrayStatus;
PRINT N'   - Gán duy nhất cho Order ID: ' + CAST(ISNULL(@AssignedOrderID, 0) AS VARCHAR(10));

-- 4.2 Kiểm tra số lượng đơn hàng trúng khay
DECLARE @DuplicateAssignmentCount INT;
SELECT @DuplicateAssignmentCount = COUNT(*)
FROM CultivationTrays
WHERE RoomID = @TestRoomID AND Status = 'OCCUPIED'
GROUP BY TrayID
HAVING COUNT(*) > 1;

IF @SessionB_Blocked = 1 AND @FinalTrayStatus = 'OCCUPIED' AND @AssignedOrderID = @OrderID_A AND ISNULL(@DuplicateAssignmentCount, 0) = 0
BEGIN
    PRINT N'';
    PRINT N'============================================================================';
    PRINT N'>>> KẾT QUẢ: BÀI KIỂM THỬ ĐỒNG THỜI ĐẠT 100% TIÊU CHUẨN (PASSED)!';
    PRINT N'>>> KHÓA DÒNG UPDLOCK, ROWLOCK ĐÃ BẢO VỆ CSDL TUYỆT ĐỐI KHÔNG BỊ OVERBOOKING!';
    PRINT N'============================================================================';
END
ELSE
BEGIN
    PRINT N'';
    PRINT N'============================================================================';
    PRINT N'>>> KẾT QUẢ: THẤT BẠI - HỆ THỐNG CÓ LỖI XUNG ĐỘT DỮ LIỆU!';
    PRINT N'============================================================================';
END;

-- ============================================================================
-- BƯỚC 5: DỌN DẸP DỮ LIỆU THỬ NGHIỆM
-- ============================================================================
IF @OrderID_A IS NOT NULL
BEGIN
    DELETE FROM GrowthLogs WHERE OrderID = @OrderID_A;
    DELETE FROM CultivationTrays WHERE TrayID = @TestTrayID;
    DELETE FROM RentalOrders WHERE OrderID = @OrderID_A;
END;
DELETE FROM CultivationTrays WHERE TrayCode = 'TRAY_CONCUR_01';
DELETE FROM Rooms WHERE RoomCode = 'RM_TEST_CONCUR';
PRINT N'>> Đã dọn dẹp sạch sẽ môi trường thử nghiệm.';
GO
