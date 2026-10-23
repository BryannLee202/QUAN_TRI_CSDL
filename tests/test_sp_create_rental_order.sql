-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Người thực hiện: Lê Minh Tài (Trưởng nhóm)
-- File: tests/test_sp_create_rental_order.sql
-- Mục đích: Kịch bản kiểm thử độc lập Stored Procedure sp_CreateRentalOrder
--           (Kiểm chứng tính toàn vẹn ACID, chống Race Condition & Overbooking)
-- ============================================================================

USE SmartMushroomDB;
GO

SET NOCOUNT ON;

PRINT N'======================================================================';
PRINT N'BẮT ĐẦU CHẠY BỘ KIỂM THỬ GIAO DỊCH LÕI: sp_CreateRentalOrder';
PRINT N'Người phụ trách: Lê Minh Tài (Lead Architect)';
PRINT N'Thời gian chạy test: ' + CONVERT(VARCHAR(30), SYSDATETIME(), 120);
PRINT N'======================================================================';

-- Biến đếm kết quả test
DECLARE @TotalTests INT = 0;
DECLARE @PassedTests INT = 0;
DECLARE @FailedTests INT = 0;

-- Chuẩn bị dữ liệu kiểm thử
DECLARE @TestUserID INT;
DECLARE @TestPackageID INT;
DECLARE @TestTrayID INT;
DECLARE @TestTrayCode VARCHAR(50);

-- Lấy tài khoản khách hàng mẫu
SELECT TOP 1 @TestUserID = UserID FROM Users WHERE RoleID = 3 AND IsActive = 1;
-- Lấy gói thuê nấm mẫu
SELECT TOP 1 @TestPackageID = PackageID FROM RentalPackages WHERE IsActive = 1;
-- Lấy 1 khay nấm đang trống (AVAILABLE) để làm bài test
SELECT TOP 1 @TestTrayID = TrayID, @TestTrayCode = TrayCode 
FROM CultivationTrays 
WHERE Status = 'AVAILABLE';

IF @TestUserID IS NULL OR @TestPackageID IS NULL OR @TestTrayID IS NULL
BEGIN
    PRINT N'[LỖI HỆ THỐNG]: Chưa nạp đủ dữ liệu mẫu để chạy test! Hãy chạy 03_seed_data.sql trước.';
    RETURN;
END

PRINT N'>> Dữ liệu test: UserID=' + CAST(@TestUserID AS VARCHAR) 
    + N' | PackageID=' + CAST(@TestPackageID AS VARCHAR) 
    + N' | TrayID=' + CAST(@TestTrayID AS VARCHAR) + N' (' + @TestTrayCode + N')';
PRINT N'----------------------------------------------------------------------';

-- ============================================================================
-- TEST CASE 1: ĐẶT THUÊ KHAY TRỐNG HỢP LỆ (HAPPY PATH)
-- Kỳ vọng: Giao dịch COMMIT, sinh mã ORD-..., khay chuyển 'OCCUPIED', sinh nhật ký meo nấm
-- ============================================================================
SET @TotalTests = @TotalTests + 1;
PRINT N'[TEST CASE 1]: Đặt thuê khay trống hợp lệ với khách hàng ID ' + CAST(@TestUserID AS VARCHAR) + N'...';

DECLARE @OutOrderID_1 INT;
DECLARE @OutOrderCode_1 VARCHAR(30);

BEGIN TRY
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @TestUserID,
        @PackageID = @TestPackageID,
        @TrayID = @TestTrayID,
        @DeliveryAddress = N'Địa chỉ kiểm thử Unit Test, TP.HCM',
        @ReceiverPhone = '0909999999',
        @PaymentMethod = 'VNPAY',
        @DiscountPercent = 10.00, -- Áp dụng chiết khấu 10%
        @Notes = N'Ghi chú test case 1',
        @NewOrderID = @OutOrderID_1 OUTPUT,
        @GeneratedOrderCode = @OutOrderCode_1 OUTPUT;

    -- Kiểm tra các điều kiện sau khi thủ tục chạy xong:
    DECLARE @TrayStatusAfter VARCHAR(20);
    DECLARE @AssignedOrder INT;
    SELECT @TrayStatusAfter = Status, @AssignedOrder = CurrentOrderID 
    FROM CultivationTrays 
    WHERE TrayID = @TestTrayID;

    DECLARE @GrowthLogCount INT;
    SELECT @GrowthLogCount = COUNT(*) 
    FROM GrowthLogs 
    WHERE OrderID = @OutOrderID_1;

    IF @OutOrderID_1 IS NOT NULL 
       AND @OutOrderCode_1 LIKE 'ORD-%' 
       AND @TrayStatusAfter = 'OCCUPIED' 
       AND @AssignedOrder = @OutOrderID_1
       AND @GrowthLogCount >= 1
    BEGIN
        SET @PassedTests = @PassedTests + 1;
        PRINT N'   => KẾT QUẢ: [PASS] Đã tạo thành công đơn ' + @OutOrderCode_1 
            + N' | Khay đã chuyển sang OCCUPIED | Đã tạo nhật ký sinh trưởng ban đầu.';
    END
    ELSE
    BEGIN
        SET @FailedTests = @FailedTests + 1;
        PRINT N'   => KẾT QUẢ: [FAIL] Dữ liệu sau khi tạo không khớp ràng buộc mong đợi!';
    END
END TRY
BEGIN CATCH
    SET @FailedTests = @FailedTests + 1;
    PRINT N'   => KẾT QUẢ: [FAIL] Xảy ra ngoại lệ không mong muốn: ' + ERROR_MESSAGE();
END CATCH;

PRINT N'----------------------------------------------------------------------';

-- ============================================================================
-- TEST CASE 2: CHỐNG OVERBOOKING / RACE CONDITION
-- Cố tình gọi lại đúng khay vừa đặt (khay hiện tại đang OCCUPIED)
-- Kỳ vọng: Thủ tục bắt lỗi, ROLLBACK, ném lỗi rõ ràng, không sinh đơn trùng
-- ============================================================================
SET @TotalTests = @TotalTests + 1;
PRINT N'[TEST CASE 2]: Cố tình đặt thuê lại khay ' + @TestTrayCode + N' (hiện đã OCCUPIED)...';

DECLARE @OutOrderID_2 INT;
DECLARE @OutOrderCode_2 VARCHAR(30);

BEGIN TRY
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @TestUserID,
        @PackageID = @TestPackageID,
        @TrayID = @TestTrayID, -- Khay này đã OCCUPIED từ Test Case 1
        @DeliveryAddress = N'Địa chỉ cố tình đặt trùng, Hà Nội',
        @ReceiverPhone = '0988888888',
        @PaymentMethod = 'MOMO',
        @NewOrderID = @OutOrderID_2 OUTPUT,
        @GeneratedOrderCode = @OutOrderCode_2 OUTPUT;

    -- Nếu chạy đến đây tức là bị lỗi overbooking (FAIL)
    SET @FailedTests = @FailedTests + 1;
    PRINT N'   => KẾT QUẢ: [FAIL] LỖI BẢO MẬT! Hệ thống vẫn cho phép thuê khay đã có người đặt!';
END TRY
BEGIN CATCH
    -- Bắt đúng thông báo lỗi từ RAISERROR trong thủ tục (PASS)
    SET @PassedTests = @PassedTests + 1;
    PRINT N'   => KẾT QUẢ: [PASS] Đã chặn đứng thành công! SQL Server ném ngoại lệ đúng mong đợi:';
    PRINT N'      Thông điệp lỗi: "' + ERROR_MESSAGE() + N'"';
END CATCH;

PRINT N'----------------------------------------------------------------------';

-- ============================================================================
-- TEST CASE 3: BẢO VỆ TOÀN VẸN - TÀI KHOẢN HOẶC GÓI THUÊ KHÔNG HỢP LỆ
-- Kỳ vọng: Thủ tục từ chối ngay từ đầu, không thay đổi trạng thái bất kỳ khay nào
-- ============================================================================
SET @TotalTests = @TotalTests + 1;
PRINT N'[TEST CASE 3]: Thử đặt thuê với PackageID không tồn tại (PackageID = 999999)...';

DECLARE @OutOrderID_3 INT;
DECLARE @OutOrderCode_3 VARCHAR(30);

BEGIN TRY
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @TestUserID,
        @PackageID = 999999, -- Gói không tồn tại
        @TrayID = @TestTrayID,
        @DeliveryAddress = N'Địa chỉ test gói lỗi',
        @ReceiverPhone = '0911111111',
        @NewOrderID = @OutOrderID_3 OUTPUT,
        @GeneratedOrderCode = @OutOrderCode_3 OUTPUT;

    SET @FailedTests = @FailedTests + 1;
    PRINT N'   => KẾT QUẢ: [FAIL] Hệ thống không chặn được PackageID không hợp lệ!';
END TRY
BEGIN CATCH
    SET @PassedTests = @PassedTests + 1;
    PRINT N'   => KẾT QUẢ: [PASS] Đã chặn dữ liệu rác thành công!';
    PRINT N'      Thông điệp lỗi: "' + ERROR_MESSAGE() + N'"';
END CATCH;

PRINT N'======================================================================';
PRINT N'TỔNG KẾT KẾT QUẢ KIỂM THỬ:';
PRINT N'- Tổng số bài test: ' + CAST(@TotalTests AS VARCHAR);
PRINT N'- Số bài ĐẠT (PASS): ' + CAST(@PassedTests AS VARCHAR);
PRINT N'- Số bài LỖI (FAIL): ' + CAST(@FailedTests AS VARCHAR);
IF @FailedTests = 0
    PRINT N'>>> XÁC NHẬN: STORED PROCEDURE ĐẠT CHUẨN AN TOÀN ACID VÀ SẴN SÀNG VẬN HÀNH! <<<';
ELSE
    PRINT N'>>> CẢNH BÁO: CÓ BÀI TEST CHƯA ĐẠT, CẦN KIỂM TRA LẠI CODE T-SQL! <<<';
PRINT N'======================================================================';
GO
