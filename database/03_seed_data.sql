-- ============================================================================
-- ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU & PHÁT TRIỂN ỨNG DỤNG WEB
-- HỆ THỐNG QUẢN LÝ NUÔI TRỒNG NẤM THÔNG MINH TÍCH HỢP CHO THUÊ VÀ GIÁM SÁT TỪ XA
-- Database: SmartMushroomDB (Microsoft SQL Server / T-SQL)
-- File: 03_seed_data.sql - Nạp Dữ Liệu Mẫu Thực Tế (Realistic Seed Data)
-- ============================================================================

USE SmartMushroomDB;
GO

SET NOCOUNT ON;

-- 1. NẠP BẢNG ROLES
IF NOT EXISTS (SELECT 1 FROM Roles WHERE RoleName = 'ADMIN')
BEGIN
    INSERT INTO Roles (RoleName, Description) VALUES
    ('ADMIN', N'Quản trị viên toàn quyền hệ thống'),
    ('OPERATOR', N'Kỹ thuật viên vận hành trang trại và quản lý khay nấm'),
    ('CUSTOMER', N'Khách hàng thuê khay nấm trực tuyến và theo dõi từ xa');
END
GO

-- 2. NẠP BẢNG USERS
-- Mật khẩu mặc định là 'Password123@' (Đã băm SHA256 / BCrypt sẵn để demo)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@mushroomcloud.vn')
BEGIN
    INSERT INTO Users (RoleID, FullName, Email, PhoneNumber, PasswordHash, Address, AvatarUrl) VALUES
    (1, N'Quản Trị Viên Hệ Thống', 'admin@mushroomcloud.vn', '0901234567', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', N'Khu Nông Nghiệp Công Nghệ Cao, Củ Chi, TP.HCM', '/avatars/admin.webp'),
    (2, N'Kỹ Thuật Viên Trang Trại', 'operator@mushroomcloud.vn', '0912345678', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', N'Trại nấm MushroomCloud Farm, Lâm Đồng', '/avatars/operator.webp'),
    (3, N'Nguyễn Văn An', 'an.nguyen@gmail.com', '0987654321', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', N'Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM', '/avatars/customer1.webp'),
    (3, N'Hoàng Huy', 'huy.hoang@gmail.com', '0978123456', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', N'45 Lê Lợi, TP. Đà Nẵng', '/avatars/customer2.webp'),
    (3, N'Võ Duy Thịnh', 'thinh.vo@gmail.com', '0934567890', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', N'78 Cầu Giấy, Hà Nội', '/avatars/customer3.webp');
END
GO

-- 3. NẠP BẢNG MUSHROOM SPECIES (DANH MỤC CÁC LOÀI NẤM)
IF NOT EXISTS (SELECT 1 FROM MushroomSpecies WHERE SpeciesName = N'Nấm Bào Ngư Xám')
BEGIN
    INSERT INTO MushroomSpecies 
    (
        SpeciesName, ScientificName, OptimalTempMin, OptimalTempMax, 
        OptimalHumidityMin, OptimalHumidityMax, OptimalCO2Max, 
        GrowthDurationDays, EstimatedYieldKgPerTray, Description, ImageUrl
    ) 
    VALUES
    (
        N'Nấm Bào Ngư Xám', 'Pleurotus ostreatus', 
        22.00, 26.00, 85.00, 92.00, 800.00, 
        30, 1.60, 
        N'Giòn ngọt, giàu protein và vitamin nhóm B. Dễ trồng, tỷ lệ thành công cao, thu hoạch nhanh.',
        '/images/species/oyster_mushroom.webp'
    ),
    (
        N'Nấm Hoàng Kim', 'Pleurotus citrinopileatus', 
        23.00, 28.00, 80.00, 90.00, 900.00, 
        35, 1.40, 
        N'Màu vàng kim rực rỡ, hương thơm bùi đặc trưng, hàm lượng chất chống oxy hóa cao.',
        '/images/species/golden_oyster.webp'
    ),
    (
        N'Nấm Hầu Thủ (Đầu Khỉ)', 'Hericium erinaceus', 
        18.00, 24.00, 88.00, 95.00, 700.00, 
        45, 1.80, 
        N'Nấm quý hỗ trợ thần kinh và trí nhớ, vị ngọt thanh tựa thịt tôm hùm.',
        '/images/species/lions_mane.webp'
    ),
    (
        N'Nấm Linh Chi Đỏ', 'Ganoderma lucidum', 
        24.00, 30.00, 75.00, 88.00, 1000.00, 
        90, 1.20, 
        N'Dược liệu quý bồi bổ sức khỏe, tăng cường miễn dịch và ổn định huyết áp.',
        '/images/species/lingzhi.webp'
    ),
    (
        N'Đông Trùng Hạ Thảo', 'Cordyceps militaris', 
        18.00, 22.00, 80.00, 90.00, 600.00, 
        60, 0.60, 
        N'Thần dược sinh học nuôi cấy trong buồng sạch vô trùng, giàu Cordycepin và Adenosine.',
        '/images/species/cordyceps.webp'
    );
END
GO

-- 4. NẠP BẢNG ROOMS (BUỒNG NUÔI TRỒNG)
IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomCode = 'ROOM-01')
BEGIN
    INSERT INTO Rooms (RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max, CameraStreamUrl, Description) VALUES
    ('ROOM-01', N'Buồng Nuôi Trồng #01 (Bào Ngư & Hoàng Kim)', 50, 21.00, 27.00, 82.00, 94.00, 850.00, '/streams/room01_live.m3u8', N'Phòng nuôi nấm thương phẩm kiểm soát vi khí hậu bằng máy sương siêu âm và quạt hút tầng thấp.'),
    ('ROOM-02', N'Buồng Nuôi Trồng #02 (Hầu Thủ & Linh Chi Dược Liệu)', 50, 18.00, 25.00, 85.00, 95.00, 750.00, '/streams/room02_live.m3u8', N'Buồng phòng sạch vi sinh áp suất dương tiêu chuẩn nuôi cấy nấm dược liệu quý.');
END
GO

-- 5. NẠP BẢNG RENTAL PACKAGES (GÓI THUÊ KHAY NẤM)
IF NOT EXISTS (SELECT 1 FROM RentalPackages WHERE PackageName LIKE N'%Bào Ngư%')
BEGIN
    DECLARE @SpOyster INT, @SpGolden INT, @SpLions INT, @SpLingzhi INT, @SpCordyceps INT;
    SELECT @SpOyster = SpeciesID FROM MushroomSpecies WHERE SpeciesName = N'Nấm Bào Ngư Xám';
    SELECT @SpGolden = SpeciesID FROM MushroomSpecies WHERE SpeciesName = N'Nấm Hoàng Kim';
    SELECT @SpLions = SpeciesID FROM MushroomSpecies WHERE SpeciesName = N'Nấm Hầu Thủ (Đầu Khỉ)';
    SELECT @SpLingzhi = SpeciesID FROM MushroomSpecies WHERE SpeciesName = N'Nấm Linh Chi Đỏ';
    SELECT @SpCordyceps = SpeciesID FROM MushroomSpecies WHERE SpeciesName = N'Đông Trùng Hạ Thảo';

    INSERT INTO RentalPackages (SpeciesID, PackageName, DurationDays, Price, ExpectedYieldKg, Description) VALUES
    (@SpOyster, N'Gói Nấm Bào Ngư Trải Nghiệm (30 Ngày)', 30, 290000.00, 1.60, N'Trải nghiệm 30 ngày nuôi nấm bào ngư xám, cam kết tối thiểu 1.6kg nấm tươi giao tận nhà.'),
    (@SpGolden, N'Gói Nấm Hoàng Kim Tươi Sạch (35 Ngày)', 35, 390000.00, 1.40, N'Sở hữu khay nấm hoàng kim vàng rực, giám sát trực tuyến 24/7 qua camera.'),
    (@SpLions, N'Gói Nấm Hầu Thủ Bổ Dưỡng (45 Ngày)', 45, 650000.00, 1.80, N'Nuôi nấm đầu khỉ bổ não, kỹ thuật viên chăm sóc đạt chuẩn hữu cơ quốc tế.'),
    (@SpLingzhi, N'Gói Linh Chi Thượng Hạng (90 Ngày)', 90, 1200000.00, 1.20, N'Gói dài hạn 3 tháng thu hái tai nấm linh chi đỏ bánh tẻ sấy khô hút chân không đóng hộp quà biếu.'),
    (@SpCordyceps, N'Gói Đông Trùng Hạ Thảo Hoàng Gia (60 Ngày)', 60, 2400000.00, 0.60, N'Gói VIP buồng sạch vô trùng, hàm lượng dược tính Cordycepin phân tích kiểm định trước khi giao.');
END
GO

-- 6. NẠP BẢNG CULTIVATION TRAYS (50 KHAY PHÒNG 1 VÀ 30 KHAY PHÒNG 2)
IF NOT EXISTS (SELECT 1 FROM CultivationTrays WHERE TrayCode = 'TRAY-RM01-R01-01')
BEGIN
    DECLARE @Room1ID INT, @Room2ID INT;
    SELECT @Room1ID = RoomID FROM Rooms WHERE RoomCode = 'ROOM-01';
    SELECT @Room2ID = RoomID FROM Rooms WHERE RoomCode = 'ROOM-02';

    -- Sinh tự động 50 khay cho Phòng 1 (5 kệ, mỗi kệ 2 tầng, mỗi tầng 5 khay)
    DECLARE @r INT = 1;
    WHILE @r <= 5
    BEGIN
        DECLARE @shelf INT = 1;
        WHILE @shelf <= 2
        BEGIN
            DECLARE @pos INT = 1;
            WHILE @pos <= 5
            BEGIN
                DECLARE @code VARCHAR(50);
                SET @code = 'TRAY-RM01-R' + RIGHT('0' + CAST(@r AS VARCHAR(2)), 2) + '-' + CAST(@shelf AS VARCHAR(1)) + RIGHT('0' + CAST(@pos AS VARCHAR(2)), 2);

                INSERT INTO CultivationTrays (TrayCode, RoomID, RackNumber, ShelfLevel, PositionNumber, Status)
                VALUES (@code, @Room1ID, @r, @shelf, @pos, 'AVAILABLE');

                SET @pos = @pos + 1;
            END
            SET @shelf = @shelf + 1;
        END
        SET @r = @r + 1;
    END

    -- Sinh tự động 20 khay cho Phòng 2
    DECLARE @r2 INT = 1;
    WHILE @r2 <= 2
    BEGIN
        DECLARE @shelf2 INT = 1;
        WHILE @shelf2 <= 2
        BEGIN
            DECLARE @pos2 INT = 1;
            WHILE @pos2 <= 5
            BEGIN
                DECLARE @code2 VARCHAR(50);
                SET @code2 = 'TRAY-RM02-R' + RIGHT('0' + CAST(@r2 AS VARCHAR(2)), 2) + '-' + CAST(@shelf2 AS VARCHAR(1)) + RIGHT('0' + CAST(@pos2 AS VARCHAR(2)), 2);

                INSERT INTO CultivationTrays (TrayCode, RoomID, RackNumber, ShelfLevel, PositionNumber, Status)
                VALUES (@code2, @Room2ID, @r2, @shelf2, @pos2, 'AVAILABLE');

                SET @pos2 = @pos2 + 1;
            END
            SET @shelf2 = @shelf2 + 1;
        END
        SET @r2 = @r2 + 1;
    END
END
GO

-- 7. TẠO CÁC ĐƠN HÀNG MẪU BẰNG STORED PROCEDURE (DEMO KHAY ĐANG NUÔI)
IF NOT EXISTS (SELECT 1 FROM RentalOrders)
BEGIN
    DECLARE @CustAnID INT, @CustHuyID INT, @PkgOyster INT, @PkgGolden INT;
    SELECT @CustAnID = UserID FROM Users WHERE Email = 'an.nguyen@gmail.com';
    SELECT @CustHuyID = UserID FROM Users WHERE Email = 'huy.hoang@gmail.com';
    SELECT @PkgOyster = PackageID FROM RentalPackages WHERE PackageName LIKE N'%Bào Ngư%';
    SELECT @PkgGolden = PackageID FROM RentalPackages WHERE PackageName LIKE N'%Hoàng Kim%';

    DECLARE @TrayAn INT, @TrayHuy INT;
    SELECT TOP 1 @TrayAn = TrayID FROM CultivationTrays WHERE TrayCode = 'TRAY-RM01-R01-101';
    SELECT TOP 1 @TrayHuy = TrayID FROM CultivationTrays WHERE TrayCode = 'TRAY-RM01-R01-102';

    DECLARE @OutOrder1 INT, @OutCode1 VARCHAR(30);
    DECLARE @OutOrder2 INT, @OutCode2 VARCHAR(30);

    -- Tạo đơn thuê cho khách An
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @CustAnID,
        @PackageID = @PkgOyster,
        @TrayID = @TrayAn,
        @DeliveryAddress = N'123 Nguyễn Huệ, Quận 1, TP.HCM',
        @ReceiverPhone = '0987654321',
        @PaymentMethod = 'VNPAY',
        @Notes = N'Giao vào giờ hành chính, gọi trước 15 phút.',
        @NewOrderID = @OutOrder1 OUTPUT,
        @GeneratedOrderCode = @OutCode1 OUTPUT;

    -- Đẩy lùi ngày cấy meo của đơn anh An về 18 ngày trước để giả lập khay nấm đã ở Ngày 18/30 (Sắp thu hoạch)
    UPDATE CultivationTrays
    SET InoculationDate = DATEADD(DAY, -18, SYSDATETIME()),
        ExpectedHarvestDate = DATEADD(DAY, 12, SYSDATETIME())
    WHERE TrayID = @TrayAn;

    -- Thêm nhật ký sinh trưởng các ngày trước cho anh An
    INSERT INTO GrowthLogs (TrayID, OrderID, StageName, PhotoUrl, HeightMm, Notes, RecordedBy, LogDate) VALUES
    (@TrayAn, @OutOrder1, N'Ủ tơ lan kín phôi', '/uploads/growth/day07_mycelium.webp', 15.0, N'Sợi nấm phát triển dày đặc, trắng đều mặt bịch phôi.', 2, DATEADD(DAY, -11, SYSDATETIME())),
    (@TrayAn, @OutOrder1, N'Kích ẩm nhú mầm nụ', '/uploads/growth/day14_pinheads.webp', 42.0, N'Bắt đầu phun sương độ ẩm 90%, quả thể nấm đã nhú chùm nụ đẹp mắt.', 2, DATEADD(DAY, -4, SYSDATETIME())),
    (@TrayAn, @OutOrder1, N'Xòe mũ phát triển mạnh', '/uploads/growth/day18_maturing.webp', 75.0, N'Tai nấm xòe rộng, màu xám bạc khỏe mạnh, dự kiến 3 ngày nữa có thể thu hái đợt 1.', 2, SYSDATETIME());

    -- Tạo đơn thuê cho khách Huy
    EXEC dbo.sp_CreateRentalOrder
        @UserID = @CustHuyID,
        @PackageID = @PkgGolden,
        @TrayID = @TrayHuy,
        @DeliveryAddress = N'45 Lê Lợi, TP. Đà Nẵng',
        @ReceiverPhone = '0978123456',
        @PaymentMethod = 'MOMO',
        @Notes = N'Nấm tươi đóng thùng xốp ướp lạnh chuyển phát nhanh.',
        @NewOrderID = @OutOrder2 OUTPUT,
        @GeneratedOrderCode = @OutCode2 OUTPUT;
END
GO

-- 8. NẠP DỮ LIỆU TELEMETRY CẢM BIẾN MẪU (24 GIỜ QUA CHO PHÒNG 1 & PHÒNG 2)
IF NOT EXISTS (SELECT 1 FROM SensorData)
BEGIN
    DECLARE @Room1 INT, @Room2 INT;
    SELECT @Room1 = RoomID FROM Rooms WHERE RoomCode = 'ROOM-01';
    SELECT @Room2 = RoomID FROM Rooms WHERE RoomCode = 'ROOM-02';

    DECLARE @h INT = 24;
    WHILE @h >= 0
    BEGIN
        DECLARE @TimePoint DATETIME2(3) = DATEADD(HOUR, -@h, SYSDATETIME());

        -- Dữ liệu bình thường phòng 1
        INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, LightLux, RecordedAt)
        VALUES 
        (@Room1, 23.50 + (RAND() * 1.5), 88.00 + (RAND() * 4.0), 650.00 + (RAND() * 120.0), 750.0, @TimePoint);

        -- Dữ liệu phòng 2
        INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, LightLux, RecordedAt)
        VALUES 
        (@Room2, 19.80 + (RAND() * 1.2), 91.00 + (RAND() * 3.5), 580.00 + (RAND() * 80.0), 400.0, @TimePoint);

        SET @h = @h - 1;
    END

    -- Giả lập 1 mốc bất thường để test Trigger: Cố tình chèn mốc CO2 cao để kích hoạt cảnh báo SensorAlerts
    INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, LightLux, RecordedAt)
    VALUES (@Room1, 28.50, 78.00, 1250.00, 900.0, SYSDATETIME());
END
GO

PRINT N'>>> ĐÃ NẠP THÀNH CÔNG DỮ LIỆU MẪU ĐẦY ĐỦ CHO SMARTMUSHROOMDB! <<<';
GO
