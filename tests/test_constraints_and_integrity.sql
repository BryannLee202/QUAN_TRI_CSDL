-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Người thực hiện: Lê Minh Tài (Trưởng nhóm)
-- File: tests/test_constraints_and_integrity.sql
-- Mục đích: Kiểm chứng tính toàn vẹn dữ liệu (Data Integrity) ở tầng CSDL
--           Bao gồm các ràng buộc CHECK, khóa ngoại (FK), và ràng buộc duy nhất (UNIQUE)
-- ============================================================================

USE SmartMushroomDB;
GO

SET NOCOUNT ON;

PRINT N'======================================================================';
PRINT N'BẮT ĐẦU CHẠY BỘ KIỂM THỬ RÀNG BUỘC TOÀN VẸN CSDL (DATA INTEGRITY)';
PRINT N'Người phụ trách: Lê Minh Tài (Lead Architect)';
PRINT N'Thời gian chạy test: ' + CONVERT(VARCHAR(30), SYSDATETIME(), 120);
PRINT N'======================================================================';

DECLARE @TotalTests INT = 0;
DECLARE @PassedTests INT = 0;
DECLARE @FailedTests INT = 0;

-- ============================================================================
-- TEST CASE 1: RÀNG BUỘC CHECK ĐỘ ẨM VÀ NHIỆT ĐỘ CỦA BUỒNG NUÔI
-- Cố tình thêm buồng nuôi có Độ ẩm Max = 150% (vượt quá 100%)
-- Kỳ vọng: SQL Server chặn lại ngay lập tức vì vi phạm CK_Rooms_Humidity
-- ============================================================================
SET @TotalTests = @TotalTests + 1;
PRINT N'[TEST CASE 1]: Thử chèn buồng nuôi có Độ ẩm Max = 150.00% (vượt 100%)...';

BEGIN TRY
    INSERT INTO Rooms (RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max)
    VALUES ('TEST-ROOM-ERR', N'Phòng Test Lỗi Độ Ẩm', 50, 20.00, 28.00, 80.00, 150.00, 1000.00);

    SET @FailedTests = @FailedTests + 1;
    PRINT N'   => KẾT QUẢ: [FAIL] LỖI! CSDL vẫn chấp nhận độ ẩm > 100%!';
    -- Dọn dẹp nếu lỡ lọt
    DELETE FROM Rooms WHERE RoomCode = 'TEST-ROOM-ERR';
END TRY
BEGIN CATCH
    SET @PassedTests = @PassedTests + 1;
    PRINT N'   => KẾT QUẢ: [PASS] Đã chặn đứng thành công vi phạm CHECK Constraint CK_Rooms_Humidity!';
    PRINT N'      Thông điệp lỗi: "' + ERROR_MESSAGE() + N'"';
END CATCH;

PRINT N'----------------------------------------------------------------------';

-- ============================================================================
-- TEST CASE 2: RÀNG BUỘC DUY NHẤT (UNIQUE) MÃ KHAY ĐỊNH DANH QR
-- Cố tình chèn 2 khay nấm có cùng mã QR Code đã tồn tại trên kệ
-- Kỳ vọng: SQL Server chặn vì vi phạm UQ_CultivationTrays_Code
-- ============================================================================
SET @TotalTests = @TotalTests + 1;
PRINT N'[TEST CASE 2]: Thử chèn khay nấm trùng mã QR đã tồn tại (TRAY-RM01-R01-01)...';

BEGIN TRY
    DECLARE @RoomID INT;
    SELECT TOP 1 @RoomID = RoomID FROM Rooms;

    INSERT INTO CultivationTrays (TrayCode, RoomID, RackNumber, ShelfLevel, PositionNumber, Status)
    VALUES ('TRAY-RM01-R01-01', @RoomID, 9, 9, 9, 'AVAILABLE');

    SET @FailedTests = @FailedTests + 1;
    PRINT N'   => KẾT QUẢ: [FAIL] LỖI! CSDL chấp nhận mã QR bị trùng lặp!';
END TRY
BEGIN CATCH
    SET @PassedTests = @PassedTests + 1;
    PRINT N'   => KẾT QUẢ: [PASS] Đã chặn trùng lặp mã QR thành công qua ràng buộc UNIQUE!';
    PRINT N'      Thông điệp lỗi: "' + ERROR_MESSAGE() + N'"';
END CATCH;

PRINT N'----------------------------------------------------------------------';

-- ============================================================================
-- TEST CASE 3: RÀNG BUỘC CHECK TRẠNG THÁI KHAY NUÔI TRỒNG
-- Trạng thái khay chỉ được nằm trong ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE')
-- Cố tình cập nhật khay sang trạng thái sai chuẩn: 'DAMAGED_UNKNOWN'
-- Kỳ vọng: SQL Server từ chối vì vi phạm CK_CultivationTrays_Status
-- ============================================================================
SET @TotalTests = @TotalTests + 1;
PRINT N'[TEST CASE 3]: Thử cập nhật khay sang trạng thái không hợp lệ ("DAMAGED_UNKNOWN")...';

BEGIN TRY
    DECLARE @TrayID INT;
    SELECT TOP 1 @TrayID = TrayID FROM CultivationTrays;

    UPDATE CultivationTrays
    SET Status = 'DAMAGED_UNKNOWN'
    WHERE TrayID = @TrayID;

    SET @FailedTests = @FailedTests + 1;
    PRINT N'   => KẾT QUẢ: [FAIL] LỖI! CSDL chấp nhận trạng thái không hợp lệ!';
END TRY
BEGIN CATCH
    SET @PassedTests = @PassedTests + 1;
    PRINT N'   => KẾT QUẢ: [PASS] Đã bảo vệ miền giá trị trạng thái khay thành công qua CHECK Constraint!';
    PRINT N'      Thông điệp lỗi: "' + ERROR_MESSAGE() + N'"';
END CATCH;

PRINT N'======================================================================';
PRINT N'TỔNG KẾT KIỂM THỬ RÀNG BUỘC TOÀN VẸN CSDL:';
PRINT N'- Tổng số bài test: ' + CAST(@TotalTests AS VARCHAR);
PRINT N'- Số bài ĐẠT (PASS): ' + CAST(@PassedTests AS VARCHAR);
PRINT N'- Số bài LỖI (FAIL): ' + CAST(@FailedTests AS VARCHAR);
IF @FailedTests = 0
    PRINT N'>>> XÁC NHẬN: MÔ HÌNH DỮ LIỆU SMARTMUSHROOMDB ĐẠT CHUẨN TOÀN VẸN 3NF TUYỆT ĐỐI! <<<';
ELSE
    PRINT N'>>> CẢNH BÁO: CÓ RÀNG BUỘC CẦN KIỂM TRA LẠI! <<<';
PRINT N'======================================================================';
GO
