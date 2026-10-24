/* =====================================================================

   Chạy SAU 01_schema.sql và 02_tsql_logic.sql, trên DB TRỐNG (DB test cục bộ).
   Không chọn DB trong file: hãy USE đúng database trước khi chạy.
   Script KHÔNG idempotent: có chốt chặn, nếu Roles đã có dữ liệu thì dừng và
   báo lỗi (tránh nạp trùng). Muốn nạp lại phải tạo lại DB test theo cách an toàn.

   ĐÂY LÀ DỮ LIỆU MẪU. Các điểm CHƯA được nhóm xác nhận:
   - Tên 3 vai trò: Admin / Operator / Customer.
   - PasswordHash là bcrypt hash THẬT (cost 10, tiền tố $2b$, dài 60 ký tự) của mật khẩu demo
     'Password123@', dùng chung cho cả 8 tài khoản. Chỉ dành cho môi trường dev/demo: mật khẩu này
     nằm công khai trong repo nên KHÔNG dùng ở production. Backend so khớp bằng thư viện bcrypt/bcryptjs.
   - Thông số nấm (nhiệt độ/độ ẩm/CO2, thời gian sinh trưởng, sản lượng) và giá gói
     là số minh họa, không phải số liệu nông học chính thức.
   - AvatarUrl, ImageUrl, CameraStreamUrl, PhotoUrl (GrowthLogs) chỉ là ĐƯỜNG DẪN GIẢ ĐỊNH
     (/avatars/..., /images/species/..., /streams/..., /uploads/growth/...), chưa có file thật.
     Frontend/backend cần khớp quy ước thư mục thật hoặc thay bằng ảnh mẫu thật.
   ===================================================================== */
USE SmartMushroomDB;
GO
SET NOCOUNT ON;

BEGIN TRY
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM Roles)
    THROW 50001, N'Roles đã có dữ liệu: seed này chỉ chạy trên DB trống.', 1;

-- ----- Roles (3 vai trò) -----
INSERT INTO Roles (RoleName, Description) VALUES
    (N'Admin',    N'Quản trị hệ thống'),
    (N'Operator', N'Kỹ thuật viên trang trại'),
    (N'Customer', N'Khách hàng thuê khay nấm');

-- ----- Users (1 Admin, 2 Operator, 5 Customer) -----
-- PasswordHash: bcrypt của 'Password123@' (mật khẩu demo dùng chung, xem ghi chú đầu file).
INSERT INTO Users (RoleID, FullName, Email, PhoneNumber, PasswordHash, Address, AvatarUrl)
SELECT r.RoleID, v.FullName, v.Email, v.PhoneNumber, N'$2b$10$.ZGg4WBvFH/I0c3sZ/U7tOPBVTu0adhl.XO4BS2GpQxfzwCPaIR7C', v.Address,
       N'/avatars/' + LEFT(v.Email, CHARINDEX('@', v.Email) - 1) + N'.webp'   -- ví dụ /avatars/customer1.webp
FROM (VALUES
    (N'Admin',    N'Nguyễn Quản Trị', 'admin@mushroomcloud.test',      '0900000001', N'Quận 1, TP. Hồ Chí Minh'),
    (N'Operator', N'Trần Kỹ Thuật',   'operator1@mushroomcloud.test',  '0900000002', N'TP. Thủ Đức, TP. Hồ Chí Minh'),
    (N'Operator', N'Lê Vận Hành',     'operator2@mushroomcloud.test',  '0900000003', N'TP. Thủ Đức, TP. Hồ Chí Minh'),
    (N'Customer', N'Phạm Minh An',    'customer1@mushroomcloud.test',  '0900000011', N'Quận 3, TP. Hồ Chí Minh'),
    (N'Customer', N'Võ Thu Hà',       'customer2@mushroomcloud.test',  '0900000012', N'Quận 7, TP. Hồ Chí Minh'),
    (N'Customer', N'Đặng Quốc Bảo',   'customer3@mushroomcloud.test',  '0900000013', N'Quận Bình Thạnh, TP. Hồ Chí Minh'),
    (N'Customer', N'Bùi Ngọc Lan',    'customer4@mushroomcloud.test',  '0900000014', N'Quận Gò Vấp, TP. Hồ Chí Minh'),
    (N'Customer', N'Hoàng Gia Khang', 'customer5@mushroomcloud.test',  '0900000015', N'TP. Biên Hòa, Đồng Nai')
) v (RoleName, FullName, Email, PhoneNumber, Address)
JOIN Roles r ON r.RoleName = v.RoleName;

-- ----- Rooms (3 buồng, tổng sức chứa 80 >= 70 khay) -----
-- Mã RM01..RM03 khớp ví dụ mã khay 'TRAY-RM01-R02-015' trong schema.
-- Ngưỡng thỏa CHECK: Temp 0..50 và min<max; Humidity 0..100 và min<max; CO2Max 0..5000.
INSERT INTO Rooms (RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max, Description, CameraStreamUrl) VALUES
    ('RM01', N'Buồng nấm bào ngư 1', 30, 20.00, 28.00, 80.00, 95.00, 1000.00, N'Buồng nuôi nấm bào ngư/sò', '/streams/rm01_live.m3u8'),
    ('RM02', N'Buồng nấm hương',     25, 18.00, 26.00, 85.00, 95.00, 1200.00, N'Buồng nuôi nấm hương (ưa mát)', '/streams/rm02_live.m3u8'),
    ('RM03', N'Buồng nấm linh chi',  25, 22.00, 30.00, 80.00, 95.00,  800.00, N'Buồng nuôi nấm linh chi', '/streams/rm03_live.m3u8');

-- ----- MushroomSpecies (4 loài) -----
INSERT INTO MushroomSpecies
    (SpeciesName, ScientificName, OptimalTempMin, OptimalTempMax, OptimalHumidityMin, OptimalHumidityMax,
     OptimalCO2Max, GrowthDurationDays, EstimatedYieldKgPerTray, Description, ImageUrl) VALUES
    (N'Nấm bào ngư xám', N'Pleurotus ostreatus',  20.00, 28.00, 80.00, 95.00, 1000.00, 30, 1.50, N'Dễ nuôi, chu kỳ ngắn', '/images/species/oyster_mushroom.webp'),
    (N'Nấm sò trắng',    N'Pleurotus florida',    22.00, 28.00, 80.00, 90.00, 1000.00, 30, 1.40, N'Thịt dày, vị ngọt', '/images/species/white_oyster.webp'),
    (N'Nấm hương',       N'Lentinula edodes',     18.00, 25.00, 85.00, 95.00, 1200.00, 60, 1.00, N'Cần nhiệt độ mát, chu kỳ dài hơn', '/images/species/shiitake.webp'),
    (N'Nấm linh chi',    N'Ganoderma lucidum',    24.00, 30.00, 80.00, 90.00,  800.00, 90, 0.50, N'Giá trị dược liệu, chu kỳ dài', '/images/species/lingzhi.webp');

-- ----- RentalPackages (6 gói, mỗi gói tham chiếu đúng 1 loài) -----
INSERT INTO RentalPackages (SpeciesID, PackageName, DurationDays, Price, ExpectedYieldKg, Description)
SELECT s.SpeciesID, v.PackageName, v.DurationDays, v.Price, v.ExpectedYieldKg, v.Description
FROM (VALUES
    (N'Nấm bào ngư xám', N'Bào ngư xám - 30 ngày', 30,  450000.00, 1.50, N'Gói thuê 1 khay, 1 chu kỳ'),
    (N'Nấm bào ngư xám', N'Bào ngư xám - 60 ngày', 60,  800000.00, 3.00, N'Gói thuê 1 khay, 2 chu kỳ'),
    (N'Nấm sò trắng',    N'Sò trắng - 30 ngày',    30,  420000.00, 1.40, N'Gói thuê 1 khay, 1 chu kỳ'),
    (N'Nấm hương',       N'Nấm hương - 60 ngày',   60,  900000.00, 1.00, N'Gói thuê 1 khay, 1 chu kỳ'),
    (N'Nấm hương',       N'Nấm hương - 90 ngày',   90, 1300000.00, 1.50, N'Gói thuê 1 khay, 1.5 chu kỳ'),
    (N'Nấm linh chi',    N'Linh chi - 90 ngày',    90, 1600000.00, 0.50, N'Gói thuê 1 khay, 1 chu kỳ')
) v (SpeciesName, PackageName, DurationDays, Price, ExpectedYieldKg, Description)
JOIN MushroomSpecies s ON s.SpeciesName = v.SpeciesName;

COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO



/*  SEED ĐƠN THUÊ (16 đơn, tháng 5-10/2026) VÀ 70 KHAY  */
/* Phụ thuộc(Users, RentalPackages, Rooms). Mốc "hôm nay" của dữ liệu mẫu: 24/10/2026.
   Quy ước (giả định, chưa xác nhận):
   - Schema không có bảng RentalOrderItems: khay gắn với đơn qua CultivationTrays.CurrentOrderID,
     một đơn có thể gắn nhiều khay. TotalAmount = Price gói x số khay thuê (giá gói hiểu là giá mỗi khay).
   - Khay OCCUPIED gắn với đơn PAID còn hiệu lực; RESERVED gắn với đơn PENDING;
     AVAILABLE và MAINTENANCE không gắn đơn. Đơn đã hết hạn/hủy/hoàn tiền không gắn khay nào.
   - Mã khay theo ví dụ trong schema: TRAY-<RoomCode>-R<kệ>-<số thứ tự trong buồng>,
     ví dụ TRAY-RM01-R02-015 (khác gợi ý TRAY-001..070 trong plan; vẫn duy nhất).
   - Mỗi kệ 5 tầng x 2 vị trí = 10 khay. 70 khay: RM01=28, RM02=22, RM03=20. */
BEGIN TRY
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM RentalOrders) OR EXISTS (SELECT 1 FROM CultivationTrays)
    THROW 50002, N'RentalOrders/CultivationTrays đã có dữ liệu: seed này chỉ chạy trên DB trống.', 1;

-- ----- RentalOrders -----
INSERT INTO RentalOrders
    (OrderCode, UserID, PackageID, StartDate, EndDate, TotalAmount, PaymentStatus, PaymentMethod,
     TransactionRef, DeliveryAddress, ReceiverPhone, Notes, CreatedAt, UpdatedAt)
SELECT v.OrderCode, u.UserID, p.PackageID, x.sd, DATEADD(DAY, p.DurationDays, x.sd),
       p.Price * v.Qty, v.PaymentStatus, v.PaymentMethod, v.TransactionRef,
       u.Address, u.PhoneNumber, v.Notes,
       CASE WHEN x.sd > CAST('2026-10-24T09:00:00' AS DATETIME2(3))
            THEN CAST('2026-10-24T09:00:00' AS DATETIME2(3)) ELSE DATEADD(DAY, -1, x.sd) END,
       CASE WHEN x.sd > CAST('2026-10-24T09:00:00' AS DATETIME2(3))
            THEN CAST('2026-10-24T09:00:00' AS DATETIME2(3)) ELSE x.sd END
FROM (VALUES
    ('ORD-2026-001', 'customer1@mushroomcloud.test', N'Bào ngư xám - 30 ngày', '2026-05-05T09:00:00', 2, 'PAID',      'VNPAY',         'TXN-2026-001', NULL),
    ('ORD-2026-002', 'customer2@mushroomcloud.test', N'Sò trắng - 30 ngày',    '2026-05-20T09:00:00', 1, 'PAID',      'MOMO',          'TXN-2026-002', NULL),
    ('ORD-2026-003', 'customer3@mushroomcloud.test', N'Nấm hương - 60 ngày',   '2026-06-10T09:00:00', 2, 'PAID',      'BANK_TRANSFER', 'TXN-2026-003', NULL),
    ('ORD-2026-004', 'customer1@mushroomcloud.test', N'Bào ngư xám - 60 ngày', '2026-06-25T09:00:00', 3, 'PAID',      'VNPAY',         'TXN-2026-004', NULL),
    ('ORD-2026-005', 'customer4@mushroomcloud.test', N'Bào ngư xám - 30 ngày', '2026-07-08T09:00:00', 2, 'PAID',      'MOMO',          'TXN-2026-005', NULL),
    ('ORD-2026-006', 'customer5@mushroomcloud.test', N'Linh chi - 90 ngày',    '2026-07-15T09:00:00', 4, 'PAID',      'BANK_TRANSFER', 'TXN-2026-006', NULL),
    ('ORD-2026-007', 'customer2@mushroomcloud.test', N'Nấm hương - 90 ngày',   '2026-08-03T09:00:00', 3, 'PAID',      'VNPAY',         'TXN-2026-007', NULL),
    ('ORD-2026-008', 'customer3@mushroomcloud.test', N'Bào ngư xám - 30 ngày', '2026-08-18T09:00:00', 2, 'CANCELLED', NULL,            NULL,           N'Khách hủy trước khi thanh toán'),
    ('ORD-2026-009', 'customer4@mushroomcloud.test', N'Sò trắng - 30 ngày',    '2026-09-02T09:00:00', 2, 'PAID',      'MOMO',          'TXN-2026-009', NULL),
    ('ORD-2026-010', 'customer5@mushroomcloud.test', N'Bào ngư xám - 60 ngày', '2026-09-12T09:00:00', 4, 'PAID',      'VNPAY',         'TXN-2026-010', NULL),
    ('ORD-2026-011', 'customer1@mushroomcloud.test', N'Nấm hương - 60 ngày',   '2026-09-20T09:00:00', 2, 'REFUNDED',  'BANK_TRANSFER', 'TXN-2026-011', N'Hoàn tiền do khách đổi lịch'),
    ('ORD-2026-012', 'customer2@mushroomcloud.test', N'Linh chi - 90 ngày',    '2026-09-28T09:00:00', 3, 'PAID',      'BANK_TRANSFER', 'TXN-2026-012', NULL),
    ('ORD-2026-013', 'customer3@mushroomcloud.test', N'Bào ngư xám - 30 ngày', '2026-10-05T09:00:00', 5, 'PAID',      'VNPAY',         'TXN-2026-013', NULL),
    ('ORD-2026-014', 'customer4@mushroomcloud.test', N'Nấm hương - 60 ngày',   '2026-10-15T09:00:00', 3, 'PAID',      'MOMO',          'TXN-2026-014', NULL),
    ('ORD-2026-015', 'customer5@mushroomcloud.test', N'Sò trắng - 30 ngày',    '2026-10-22T09:00:00', 3, 'PENDING',   NULL,            NULL,           N'Chờ thanh toán'),
    ('ORD-2026-016', 'customer1@mushroomcloud.test', N'Linh chi - 90 ngày',    '2026-11-01T09:00:00', 2, 'PENDING',   NULL,            NULL,           N'Đặt trước, chờ thanh toán')
) v (OrderCode, Email, PackageName, StartDateText, Qty, PaymentStatus, PaymentMethod, TransactionRef, Notes)
CROSS APPLY (SELECT CAST(v.StartDateText AS DATETIME2(3)) AS sd) x
JOIN Users u          ON u.Email = v.Email
JOIN RentalPackages p ON p.PackageName = v.PackageName;

IF (SELECT COUNT(*) FROM RentalOrders) <> 16
    THROW 50003, N'Số đơn thuê khác 16: kiểm tra lại seed Task 10 (Users/RentalPackages).', 1;

-- ----- CultivationTrays: 70 khay, ban đầu AVAILABLE -----
INSERT INTO CultivationTrays (TrayCode, RoomID, RackNumber, ShelfLevel, PositionNumber, Status)
SELECT CONCAT('TRAY-', r.RoomCode, '-R', FORMAT(((nn.n - 1) / 10) + 1, '00'), '-', FORMAT(nn.n, '000')),
       r.RoomID,
       ((nn.n - 1) / 10) + 1,           -- số kệ
       (((nn.n - 1) % 10) / 2) + 1,     -- tầng 1..5
       ((nn.n - 1) % 2) + 1,            -- vị trí 1..2
       'AVAILABLE'
FROM (VALUES ('RM01', 28), ('RM02', 22), ('RM03', 20)) c (RoomCode, Cnt)
JOIN Rooms r ON r.RoomCode = c.RoomCode
JOIN (SELECT TOP (28) CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS INT) AS n FROM sys.all_objects) nn
     ON nn.n <= c.Cnt
ORDER BY r.RoomID, nn.n;

-- ----- Gán trạng thái khay theo đơn (n = số thứ tự khay trong buồng) -----
DECLARE @Map TABLE (RoomCode VARCHAR(20), FromN INT, ToN INT, TrayStatus VARCHAR(20), OrderCode VARCHAR(30));
INSERT INTO @Map (RoomCode, FromN, ToN, TrayStatus, OrderCode) VALUES
    ('RM01',  1,  4, 'OCCUPIED',    'ORD-2026-010'),
    ('RM01',  5,  9, 'OCCUPIED',    'ORD-2026-013'),
    ('RM01', 10, 12, 'RESERVED',    'ORD-2026-015'),
    ('RM01', 27, 28, 'MAINTENANCE', NULL),
    ('RM02',  1,  3, 'OCCUPIED',    'ORD-2026-007'),
    ('RM02',  4,  6, 'OCCUPIED',    'ORD-2026-014'),
    ('RM02', 22, 22, 'MAINTENANCE', NULL),
    ('RM03',  1,  3, 'OCCUPIED',    'ORD-2026-012'),
    ('RM03',  4,  5, 'RESERVED',    'ORD-2026-016'),
    ('RM03', 20, 20, 'MAINTENANCE', NULL);

UPDATE ct
SET ct.Status              = m.TrayStatus,
    ct.CurrentOrderID      = o.OrderID,
    ct.InoculationDate     = CASE WHEN m.TrayStatus = 'OCCUPIED' THEN o.StartDate END,
    ct.ExpectedHarvestDate = CASE WHEN m.TrayStatus = 'OCCUPIED' THEN DATEADD(DAY, sp.GrowthDurationDays, o.StartDate) END,
    ct.LastCleanedAt       = CASE WHEN m.TrayStatus = 'MAINTENANCE' THEN CAST('2026-10-20T08:00:00' AS DATETIME2(3)) END
FROM CultivationTrays ct
JOIN (SELECT t.TrayID, rm.RoomCode,
             ROW_NUMBER() OVER (PARTITION BY t.RoomID ORDER BY t.TrayID) AS n
      FROM CultivationTrays t JOIN Rooms rm ON rm.RoomID = t.RoomID) tn ON tn.TrayID = ct.TrayID
JOIN @Map m ON m.RoomCode = tn.RoomCode AND tn.n BETWEEN m.FromN AND m.ToN
LEFT JOIN RentalOrders o     ON o.OrderCode = m.OrderCode
LEFT JOIN RentalPackages p   ON p.PackageID = o.PackageID
LEFT JOIN MushroomSpecies sp ON sp.SpeciesID = p.SpeciesID;

IF (SELECT COUNT(*) FROM CultivationTrays) <> 70
    THROW 50004, N'Số khay khác 70: kiểm tra lại seed Task 10 (Rooms).', 1;

COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO



/*  SEED NHẬT KÝ SINH TRƯỞNG (GrowthLogs) CHO KHAY ĐANG NUÔI  */
/* Phụ thuộc  (đơn ORD-2026-007/010/012/013/014 và khay OCCUPIED gắn đơn).
   Mỗi đơn đang nuôi có nhật ký cho KHAY ĐẦU TIÊN của đơn (TrayID nhỏ nhất gắn với đơn),
   do Operator đầu tiên (operator1@...) ghi nhận. Mốc "hôm nay": 24/10/2026 08:00.
   Các mốc ngày tính từ StartDate của đơn; chỉ tạo nhật ký có LogDate <= hôm nay, nên mỗi đơn có tiến độ khác nhau:
     Cấy meo (ngày 1), Ủ tơ nấm (ngày 7), Kích ẩm ra nụ (ngày 14), Phát triển quả thể (ngày 21),
     Sắp thu hoạch (GrowthDurationDays - 2).
   Kỳ vọng: 007 = 5 dòng, 010 = 5, 012 = 4, 013 = 3, 014 = 2; tổng 19.
   Tên giai đoạn lấy theo gợi ý trong chú thích cột GrowthLogs.StageName của schema.
   PhotoUrl là đường dẫn giả định (chưa có file ảnh thật). */
BEGIN TRY
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM GrowthLogs)
    THROW 50009, N'GrowthLogs đã có dữ liệu: seed này chỉ chạy trên DB trống.', 1;

DECLARE @TodayLog DATETIME2(3) = CAST('2026-10-24T08:00:00' AS DATETIME2(3));

INSERT INTO GrowthLogs (TrayID, OrderID, StageName, PhotoUrl, HeightMm, Notes, RecordedBy, LogDate)
SELECT t.TrayID, o.OrderID, s.StageName,
       CONCAT('/uploads/growth/', o.OrderCode, '_day', FORMAT(e.DayNo, '00'), '.webp'),
       s.HeightMm, s.Notes, op.UserID, DATEADD(DAY, e.DayNo, o.StartDate)
FROM RentalOrders o
JOIN RentalPackages  p  ON p.PackageID = o.PackageID
JOIN MushroomSpecies sp ON sp.SpeciesID = p.SpeciesID
CROSS JOIN (VALUES
    ( 1, N'Cấy meo',            CAST(NULL AS DECIMAL(5,1)), N'Cấy meo vào bịch phôi, đặt khay vào vị trí ủ.'),
    ( 7, N'Ủ tơ nấm',           CAST(NULL AS DECIMAL(5,1)), N'Sợi nấm lan dần, trắng đều mặt bịch phôi.'),
    (14, N'Kích ẩm ra nụ',      CAST(12.0 AS DECIMAL(5,1)), N'Tăng ẩm, quả thể bắt đầu nhú chùm nụ.'),
    (21, N'Phát triển quả thể', CAST(45.0 AS DECIMAL(5,1)), N'Tai nấm lớn nhanh, màu sắc khỏe mạnh.'),
    (-2, N'Sắp thu hoạch',      CAST(80.0 AS DECIMAL(5,1)), N'Nấm gần chín, dự kiến thu hái trong 1-2 ngày.')
) s (DayOffset, StageName, HeightMm, Notes)
CROSS APPLY (SELECT CASE WHEN s.DayOffset < 0 THEN sp.GrowthDurationDays + s.DayOffset ELSE s.DayOffset END AS DayNo) e
CROSS APPLY (SELECT MIN(ct.TrayID) AS TrayID FROM CultivationTrays ct WHERE ct.CurrentOrderID = o.OrderID) t
CROSS JOIN (SELECT UserID FROM Users WHERE Email = 'operator1@mushroomcloud.test') op
WHERE o.OrderCode IN ('ORD-2026-007', 'ORD-2026-010', 'ORD-2026-012', 'ORD-2026-013', 'ORD-2026-014')
  AND t.TrayID IS NOT NULL
  AND DATEADD(DAY, e.DayNo, o.StartDate) <= @TodayLog;

IF (SELECT COUNT(*) FROM GrowthLogs) <> 19
    THROW 50010, N'GrowthLogs không đủ 19 dòng: kiểm tra đơn/khay Task 11 và tài khoản operator1.', 1;

COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO



/* SEED LỊCH SỬ CẢM BIẾN (+ vài cảnh báo mẫu có kiểm soát) */
/* Phụ thuộc  (Rooms) và trigger trg_CheckSensorThresholds trong 02_tsql_logic.sql.
   - Lịch sử: mỗi phòng 1 bản tin / @StepMinutes, @Days ngày, kết thúc 24/10/2026 08:00.
     Giá trị dao động theo chu kỳ ngày + nhiễu giả ngẫu nhiên CÓ TÍNH QUY LUẬT (CHECKSUM, chạy lại ra cùng số),
     luôn nằm trong ngưỡng từng phòng và trong vùng hồi phục của trigger, nên KHÔNG sinh cảnh báo.
   - TRIGGER LUÔN BẬT trong suốt quá trình nạp (không DISABLE) để không có rủi ro quên bật lại.
     Nếu lịch sử vô tình sinh cảnh báo, script dừng và rollback.
   - Sau lịch sử, chèn riêng 4 bản tin có kiểm soát để tạo cảnh báo mẫu:
       RM01: CO2 1250 lúc 08:15 -> cảnh báo HIGH_CO2 (CRITICAL) còn mở + quạt ON
       RM02: CO2 1400 lúc 08:20 rồi 650 lúc 08:40 -> cảnh báo đã đóng + quạt ON rồi OFF
       RM03: nhiệt độ 31 lúc 08:25 -> cảnh báo HIGH_TEMP (WARNING) còn mở
   - Số lượng (7 ngày, 15 phút) là GIẢ ĐỊNH, đổi @Days/@StepMinutes khi nhóm quyết định khác;
     khi đó cập nhật các con số kỳ vọng trong tests/verify_seed_huy.sql (2016 + 4 dòng). */
BEGIN TRY
BEGIN TRAN;

IF EXISTS (SELECT 1 FROM SensorData) OR EXISTS (SELECT 1 FROM SensorAlerts) OR EXISTS (SELECT 1 FROM DeviceActionLogs)
    THROW 50005, N'SensorData/SensorAlerts/DeviceActionLogs đã có dữ liệu: seed này chỉ chạy trên DB trống.', 1;

IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_CheckSensorThresholds' AND is_disabled = 0)
    THROW 50006, N'Trigger trg_CheckSensorThresholds chưa có hoặc đang bị tắt: chạy 02_tsql_logic.sql trước.', 1;

DECLARE @Days INT = 7, @StepMinutes INT = 15;
DECLARE @End   DATETIME2(3) = CAST('2026-10-24T08:00:00' AS DATETIME2(3));
DECLARE @Start DATETIME2(3) = DATEADD(DAY, -@Days, @End);
DECLARE @N     INT = @Days * 1440 / @StepMinutes;   -- số bản tin mỗi phòng

-- ----- Lịch sử: 1 lệnh INSERT nhiều dòng cho cả 3 phòng -----
-- Biên độ: nhiệt độ ±(amp+0,5), độ ẩm ±(amp+1), CO2 ±(amp+40) quanh giá trị giữa; tất cả nằm trong ngưỡng phòng.
INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
SELECT r.RoomID,
       CAST(c.TMid + c.TAmp * SIN(w.angle)       + (ABS(CAST(CHECKSUM(r.RoomID, nn.n, 1) AS BIGINT)) % 1000 / 1000.0 - 0.5) * 1.0  AS DECIMAL(5,2)),
       CAST(c.HMid + c.HAmp * SIN(w.angle + 1.0) + (ABS(CAST(CHECKSUM(r.RoomID, nn.n, 2) AS BIGINT)) % 1000 / 1000.0 - 0.5) * 2.0  AS DECIMAL(5,2)),
       CAST(c.CMid + c.CAmp * SIN(w.angle + 2.0) + (ABS(CAST(CHECKSUM(r.RoomID, nn.n, 3) AS BIGINT)) % 1000 / 1000.0 - 0.5) * 80.0 AS DECIMAL(7,2)),
       DATEADD(MINUTE, nn.n * @StepMinutes, @Start)
FROM (VALUES
    ('RM01', 24.0, 1.5, 88.0, 3.0, 600.0, 120.0),   -- ngưỡng RM01: 20-28C, 80-95%, CO2 <= 1000
    ('RM02', 22.0, 1.5, 90.0, 2.0, 700.0, 150.0),   -- ngưỡng RM02: 18-26C, 85-95%, CO2 <= 1200
    ('RM03', 26.0, 1.5, 87.0, 3.0, 450.0, 100.0)    -- ngưỡng RM03: 22-30C, 80-95%, CO2 <=  800
) c (RoomCode, TMid, TAmp, HMid, HAmp, CMid, CAmp)
JOIN Rooms r ON r.RoomCode = c.RoomCode
CROSS JOIN (SELECT TOP (@N) CAST(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS INT) - 1 AS n
            FROM sys.all_objects a CROSS JOIN sys.all_objects b) nn
CROSS APPLY (SELECT 2 * PI() * ((nn.n * @StepMinutes) % 1440) / 1440.0 AS angle) w
ORDER BY r.RoomID, nn.n;

IF (SELECT COUNT(*) FROM SensorData) <> @N * 3
    THROW 50007, N'Số dòng lịch sử cảm biến không đúng: kiểm tra lại seed Task 10 (Rooms RM01-RM03).', 1;
IF EXISTS (SELECT 1 FROM SensorAlerts) OR EXISTS (SELECT 1 FROM DeviceActionLogs)
    THROW 50008, N'Lịch sử cảm biến sinh ra cảnh báo/log ngoài ý muốn: kiểm tra biên độ so với ngưỡng phòng.', 1;

-- ----- Cảnh báo mẫu có kiểm soát (trigger đang bật) -----
-- RM01: CO2 cao, để mở
INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
SELECT RoomID, 24, 88, 1250, '2026-10-24T08:15:00' FROM Rooms WHERE RoomCode = 'RM01';
-- RM02: CO2 cao rồi hồi phục
INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
SELECT RoomID, 22, 90, 1400, '2026-10-24T08:20:00' FROM Rooms WHERE RoomCode = 'RM02';
INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
SELECT RoomID, 22, 90, 650, '2026-10-24T08:40:00' FROM Rooms WHERE RoomCode = 'RM02';
-- RM03: nhiệt độ cao (ngưỡng tối đa 30), để mở
INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, RecordedAt)
SELECT RoomID, 31, 87, 450, '2026-10-24T08:25:00' FROM Rooms WHERE RoomCode = 'RM03';

COMMIT;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO
