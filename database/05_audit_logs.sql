-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU - MUSHROOMCLOUD
-- BẢNG NHẬT KÝ KIỂM TOÁN ĐA HÌNH & TRUY VẾT HÀNH ĐỘNG (AUDIT LOGGING)
-- Học hỏi kiến trúc minh bạch từ Seal_Hackathon_Webapp
-- Phụ trách: Lê Minh Tài (Trưởng nhóm / Lead Architect)
-- ============================================================================

USE SmartMushroomDB;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE dbo.AuditLogs (
        LogID BIGINT IDENTITY(1,1) NOT NULL,
        ActorID INT NULL,                       -- ID người thực hiện (NULL nếu là hệ thống/Trigger IoT)
        Action VARCHAR(50) NOT NULL,            -- 'ORDER_CREATED', 'TRAY_ASSIGNED', 'HARVEST_REQUESTED', 'HARVEST_COMPLETED', 'DEVICE_STATE_CHANGE'
        EntityType VARCHAR(50) NOT NULL,        -- 'RentalOrders', 'CultivationTrays', 'HarvestRequests', 'Devices'
        EntityID VARCHAR(50) NOT NULL,          -- Định danh đối tượng (polymorphic key)
        OldValueJSON NVARCHAR(MAX) NULL,        -- Dữ liệu JSON trước khi thay đổi
        NewValueJSON NVARCHAR(MAX) NULL,        -- Dữ liệu JSON sau khi thay đổi
        Notes NVARCHAR(500) NULL,
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_AuditLogs PRIMARY KEY CLUSTERED (LogID),
        CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (ActorID) REFERENCES dbo.Users(UserID)
    );

    CREATE NONCLUSTERED INDEX IX_AuditLogs_Entity
    ON dbo.AuditLogs (EntityType, EntityID)
    INCLUDE (Action, CreatedAt);

    PRINT N'>>> ĐÃ TẠO BẢNG VÀ CHỈ MỤC CHO AUDITLOGS THÀNH CÔNG! <<<';
END
ELSE
BEGIN
    PRINT N'>>> BẢNG AUDITLOGS ĐÃ TỒN TẠI, BỎ QUA TẠO BẢNG. <<<';
END
GO

-- Thủ tục ghi nhận nhật ký kiểm toán dùng chung
CREATE OR ALTER PROCEDURE dbo.sp_LogAuditEvent
    @ActorID INT = NULL,
    @Action VARCHAR(50),
    @EntityType VARCHAR(50),
    @EntityID VARCHAR(50),
    @OldValueJSON NVARCHAR(MAX) = NULL,
    @NewValueJSON NVARCHAR(MAX) = NULL,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.AuditLogs 
    (
        ActorID, Action, EntityType, EntityID, OldValueJSON, NewValueJSON, Notes
    )
    VALUES 
    (
        @ActorID, @Action, @EntityType, @EntityID, @OldValueJSON, @NewValueJSON, @Notes
    );
END;
GO

PRINT N'>>> ĐÃ TẠO THỦ TỤC sp_LogAuditEvent THÀNH CÔNG! <<<';
GO
