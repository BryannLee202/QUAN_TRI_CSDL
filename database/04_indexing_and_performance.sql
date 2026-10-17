-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Database: SmartMushroomDB (Microsoft SQL Server / T-SQL)
-- File: 04_indexing_and_performance.sql - Chiến Lược Đánh Chỉ Mục & Tối Ưu Truy Vấn
-- ============================================================================

USE SmartMushroomDB;
GO

-- ============================================================================
-- 1. THIẾT KẾ CHIẾN LƯỢC ĐÁNH CHỈ MỤC (INDEXING STRATEGY)
-- ============================================================================

-- 1.1. Bảng SensorData (Bảng phình to nhanh nhất - hàng triệu dòng thời gian)
-- Truy vấn phổ biến: Lọc theo buồng nuôi (RoomID) và sắp xếp theo mốc thời gian mới nhất để vẽ đồ thị
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SensorData_Room_RecordedAt')
BEGIN
    CREATE NONCLUSTERED INDEX IX_SensorData_Room_RecordedAt
    ON dbo.SensorData (RoomID ASC, RecordedAt DESC)
    INCLUDE (Temperature, Humidity, CO2Level, LightLux);
    PRINT N'>>> Đã tạo Non-Clustered Composite Index có INCLUDE cho bảng SensorData';
END
GO

-- 1.2. Bảng CultivationTrays (Tìm khay trống trong buồng nuôi khi khách bấm đặt thuê)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CultivationTrays_Room_Status')
BEGIN
    CREATE NONCLUSTERED INDEX IX_CultivationTrays_Room_Status
    ON dbo.CultivationTrays (RoomID ASC, Status ASC)
    INCLUDE (TrayCode, CurrentOrderID);
    PRINT N'>>> Đã tạo Non-Clustered Index cho bảng CultivationTrays';
END
GO

-- 1.3. Bảng RentalOrders (Khách hàng mở app lấy các đơn thuê đang hoạt động của mình)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RentalOrders_User_PaymentStatus')
BEGIN
    CREATE NONCLUSTERED INDEX IX_RentalOrders_User_PaymentStatus
    ON dbo.RentalOrders (UserID ASC, PaymentStatus ASC)
    INCLUDE (OrderCode, StartDate, EndDate, TotalAmount);
    PRINT N'>>> Đã tạo Non-Clustered Index cho bảng RentalOrders';
END
GO

-- 1.4. Bảng SensorAlerts (Kỹ thuật viên lọc các cảnh báo chưa xử lý)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SensorAlerts_Unresolved')
BEGIN
    CREATE NONCLUSTERED INDEX IX_SensorAlerts_Unresolved
    ON dbo.SensorAlerts (RoomID ASC, AlertTime DESC)
    WHERE IsResolved = 0; -- FILTERED INDEX: Chỉ lập chỉ mục các cảnh báo chưa xử lý, tiết kiệm dung lượng RAM
    PRINT N'>>> Đã tạo Filtered Index (Chỉ mục có điều kiện) cho bảng SensorAlerts';
END
GO

-- ============================================================================
-- 2. KỊCH BẢN THỰC NGHIỆM ĐO LƯỜNG HIỆU NĂNG CHO BÁO CÁO ĐỒ ÁN
-- Dùng chụp ảnh đưa vào Báo cáo & Slide thuyết trình trước Hội đồng chấm thi
-- ============================================================================

PRINT N'----------------------------------------------------------------------';
PRINT N'BẮT ĐẦU ĐO LƯỜNG HIỆU NĂNG TRUY VẤN VẼ ĐỒ THỊ VI KHÍ HẬU 24 GIỜ:';
PRINT N'----------------------------------------------------------------------';

-- Bật thống kê số lần đọc đĩa (I/O) và thời gian thực thi (Execution Time)
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Câu truy vấn tiêu biểu của Cổng Khách Hàng và Kỹ thuật viên
SELECT TOP 50
    DataID,
    RoomID,
    Temperature,
    Humidity,
    CO2Level,
    RecordedAt
FROM SensorData WITH (INDEX(IX_SensorData_Room_RecordedAt)) -- Tận dụng Index Seek
WHERE RoomID = 1 
  AND RecordedAt >= DATEADD(HOUR, -24, SYSDATETIME())
ORDER BY RecordedAt DESC;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
GO
