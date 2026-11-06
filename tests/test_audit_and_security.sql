-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU - MUSHROOMCLOUD
-- BÀI KIỂM THỬ HỆ THỐNG NHẬT KÝ KIỂM TOÁN VÀ TRUY VẾT (AUDIT & SECURITY TESTS)
-- Phụ trách: Lê Minh Tài (Trưởng nhóm / Lead Architect)
-- ============================================================================

USE SmartMushroomDB;
SET NOCOUNT ON;

PRINT N'============================================================================';
PRINT N'BẮT ĐẦU KIỂM THỬ HỆ THỐNG NHẬT KÝ KIỂM TOÁN AUDITLOGS (TRUY VẾT MINH BẠCH)';
PRINT N'============================================================================';

DECLARE @PassCount INT = 0, @FailCount INT = 0;
DECLARE @TestUserID INT, @TestLogID BIGINT;

SELECT TOP 1 @TestUserID = UserID FROM Users WHERE RoleID = 2; -- Kỹ thuật viên

-- TEST 1: Kiểm tra thủ tục sp_LogAuditEvent ghi nhận thành công
PRINT N'>> TEST 1: Thực thi sp_LogAuditEvent ghi log gán khay QR...';
BEGIN TRY
    EXEC dbo.sp_LogAuditEvent
        @ActorID = @TestUserID,
        @Action = 'TRAY_ASSIGNED',
        @EntityType = 'CultivationTrays',
        @EntityID = 'TRAY-RM01-R01-001',
        @OldValueJSON = N'{"status":"AVAILABLE"}',
        @NewValueJSON = N'{"status":"OCCUPIED","orderId":999}',
        @Notes = N'Test thủ tục ghi nhật ký từ bộ kiểm thử tự động';

    SELECT TOP 1 @TestLogID = LogID 
    FROM AuditLogs 
    WHERE EntityType = 'CultivationTrays' AND EntityID = 'TRAY-RM01-R01-001' AND Action = 'TRAY_ASSIGNED'
    ORDER BY LogID DESC;

    IF @TestLogID IS NOT NULL
    BEGIN
        PRINT N'   [PASS] Ghi nhật ký kiểm toán thành công! Mã LogID: ' + CAST(@TestLogID AS VARCHAR(20));
        SET @PassCount += 1;
    END
    ELSE
    BEGIN
        PRINT N'   [FAIL] Không tìm thấy bản ghi AuditLogs sau khi thực thi thủ tục!';
        SET @FailCount += 1;
    END
END TRY
BEGIN CATCH
    PRINT N'   [FAIL] Lỗi thực thi: ' + ERROR_MESSAGE();
    SET @FailCount += 1;
END CATCH;

-- TEST 2: Kiểm tra hiệu năng chỉ mục IX_AuditLogs_Entity
PRINT N'';
PRINT N'>> TEST 2: Kiểm tra sự tồn tại của chỉ mục tối ưu truy vấn IX_AuditLogs_Entity...';
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuditLogs_Entity' AND object_id = OBJECT_ID('dbo.AuditLogs'))
BEGIN
    PRINT N'   [PASS] Chỉ mục IX_AuditLogs_Entity đã được kích hoạt tối ưu hóa!';
    SET @PassCount += 1;
END
ELSE
BEGIN
    PRINT N'   [FAIL] Chưa đánh chỉ mục IX_AuditLogs_Entity!';
    SET @FailCount += 1;
END;

-- TEST 3: Kiểm tra ràng buộc khóa ngoại tham chiếu người dùng (FK_AuditLogs_Users)
PRINT N'';
PRINT N'>> TEST 3: Thử ghi log với ActorID không tồn tại (Negative test)...';
BEGIN TRY
    EXEC dbo.sp_LogAuditEvent
        @ActorID = 9999999,
        @Action = 'SECURITY_BREACH_ATTEMPT',
        @EntityType = 'Users',
        @EntityID = 'UNKNOWN',
        @Notes = N'Thử vi phạm khóa ngoại';

    PRINT N'   [FAIL] Nguy hiểm! Hệ thống cho phép gán ActorID không hợp lệ!';
    SET @FailCount += 1;
END TRY
BEGIN CATCH
    PRINT N'   [PASS] Ràng buộc khóa ngoại chặn đứng an toàn: ' + ERROR_MESSAGE();
    SET @PassCount += 1;
END CATCH;

-- DỌN DẸP DỮ LIỆU TEST
IF @TestLogID IS NOT NULL
    DELETE FROM AuditLogs WHERE LogID = @TestLogID;

PRINT N'';
PRINT N'============================================================================';
PRINT N'TỔNG KẾT BÀI TEST NHẬT KÝ KIỂM TOÁN AUDITLOGS:';
PRINT N'- Số bài ĐẠT (PASS): ' + CAST(@PassCount AS VARCHAR(5)) + ' / 3';
PRINT N'- Số bài LỖI (FAIL): ' + CAST(@FailCount AS VARCHAR(5));
IF @FailCount = 0
    PRINT N'>>> KẾT QUẢ: 100% CƠ CHẾ TRUY VẾT KIỂM TOÁN HOẠT ĐỘNG HOÀN HẢO! <<<';
PRINT N'============================================================================';
GO
