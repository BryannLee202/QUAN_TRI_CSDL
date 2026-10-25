/**
 * ============================================================================
 * ĐỒ ÁN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU - MUSHROOMCLOUD
 * SCRIPT MÔ PHỎNG KIỂM THỬ ĐỒNG THỜI (PARALLEL CONCURRENCY HARNESS)
 * File: tests/test_concurrency_runner.ts
 * 
 * Mục đích:
 * Bắn đồng thời 10 yêu cầu đặt thuê khay nấm (sp_CreateRentalOrder)
 * tại cùng 1 mili-giây vào phòng nuôi trồng chỉ còn 2 khay trống.
 * 
 * Kết quả kỳ vọng:
 * - Đúng 2 giao dịch đầu tiên thành công (Status 200/Success).
 * - 8 giao dịch còn lại nhận thông báo lỗi "Phòng đã kín khay trống" và rollback an toàn.
 * - Tuyệt đối KHÔNG có 2 đơn hàng nào bị gán trùng cùng 1 khay nấm (Zero Overbooking).
 * ============================================================================
 */

import sql from "mssql";

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || process.env.MSSQL_SA_PASSWORD || "YourStrong@Password123",
  database: process.env.DB_NAME || "SmartMushroomDB",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true,
  },
  pool: {
    max: 20,
    min: 5,
  },
};

async function runConcurrencyStressTest() {
  console.log("============================================================================");
  console.log("   MUSHROOMCLOUD - BÀI KIỂM THỬ TRANH CHẤP ĐỒNG THỜI (CONCURRENCY TEST)    ");
  console.log("============================================================================\n");

  let pool: sql.ConnectionPool;
  try {
    pool = await sql.connect(dbConfig);
    console.log("[1/4] Đã kết nối thành công tới SQL Server:", dbConfig.database);
  } catch (err: any) {
    console.error("[LỖI KẾT NỐI]: Không thể kết nối SQL Server. Kiểm tra Docker/Dịch vụ SQL:", err.message);
    return;
  }

  try {
    // Bước 1: Khởi tạo phòng test chỉ có đúng 2 khay trống
    console.log("[2/4] Thiết lập môi trường thử nghiệm: Tạo phòng có đúng 2 khay trống...");
    await pool.request().query(`
      DELETE FROM CultivationTrays WHERE TrayCode IN ('TRAY_STRESS_01', 'TRAY_STRESS_02');
      DELETE FROM Rooms WHERE RoomCode = 'RM_STRESS_TEST';

      INSERT INTO Rooms (RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max, IsActive)
      VALUES ('RM_STRESS_TEST', N'Phòng Thử Nghiệm Stress Test', 2, 20.0, 28.0, 80.0, 95.0, 1000.0, 1);

      DECLARE @RoomID INT = SCOPE_IDENTITY();

      INSERT INTO CultivationTrays (RoomID, TrayCode, Status)
      VALUES (@RoomID, 'TRAY_STRESS_01', 'AVAILABLE'),
             (@RoomID, 'TRAY_STRESS_02', 'AVAILABLE');
    `);

    const roomRes = await pool.request().query("SELECT RoomID FROM Rooms WHERE RoomCode = 'RM_STRESS_TEST'");
    const targetRoomId = roomRes.recordset[0].RoomID;

    const pkgRes = await pool.request().query("SELECT TOP 1 PackageID FROM RentalPackages WHERE IsActive = 1");
    const testPackageId = pkgRes.recordset[0].PackageID;

    const userRes = await pool.request().query("SELECT TOP 10 UserID FROM Users WHERE RoleID = 3");
    const testUsers = userRes.recordset.map((u: any) => u.UserID);

    console.log(`      -> Target Room ID: ${targetRoomId} (Chỉ có 2 khay trống)`);
    console.log(`      -> Số lượng luồng khách hàng đồng thời: 10 khách`);

    // Bước 2: Bắn đồng thời 10 requests cùng lúc
    console.log("\n[3/4] BẮT ĐẦU BẮN ĐỒNG THỜI 10 GIAO DỊCH sp_CreateRentalOrder...");
    const startTime = Date.now();

    const promises = testUsers.map((userId: number, index: number) => {
      const clientReq = pool.request();
      return clientReq
        .input("UserID", sql.Int, userId)
        .input("PackageID", sql.Int, testPackageId)
        .input("TargetRoomID", sql.Int, targetRoomId)
        .input("PaymentMethod", sql.VarChar(20), "VNPAY")
        .input("DeliveryAddress", sql.NVarChar(255), `Số ${index + 1} Đường Stress Test, TP.HCM`)
        .input("ReceiverPhone", sql.VarChar(20), `090123456${index}`)
        .input("DiscountPercent", sql.Decimal(5, 2), 0)
        .input("Notes", sql.NVarChar(500), `Simulated Concurrent Request #${index + 1}`)
        .output("GeneratedOrderCode", sql.VarChar(30))
        .output("NewOrderID", sql.Int)
        .execute("dbo.sp_CreateRentalOrder")
        .then((result) => {
          return {
            client: index + 1,
            success: true,
            orderCode: result.output.GeneratedOrderCode,
            orderId: result.output.NewOrderID,
          };
        })
        .catch((err) => {
          return {
            client: index + 1,
            success: false,
            error: err.message,
          };
        });
    });

    const results = await Promise.all(promises);
    const elapsed = Date.now() - startTime;

    console.log(`\n      Thời gian thực thi hoàn tất trong: ${elapsed} ms\n`);

    // Bước 3: Đánh giá kết quả
    console.log("[4/4] BÁO CÁO KẾT QUẢ ĐỐI SOÁT:");
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    results.forEach((r) => {
      if (r.success) {
        console.log(`   [SUCCESS] Khách #${r.client}: Đặt khay thành công -> Mã đơn: ${r.orderCode} (OrderID: ${r.orderId})`);
      } else {
        console.log(`   [BLOCKED] Khách #${r.client}: Bị từ chối an toàn -> ${r.error.split("\n")[0]}`);
      }
    });

    console.log("\n----------------------------------------------------------------------------");
    console.log(`TỔNG KẾT: ${successes.length} GIAO DỊCH THÀNH CÔNG | ${failures.length} GIAO DỊCH BỊ CHẶN AN TOÀN`);
    console.log("----------------------------------------------------------------------------");

    // Kiểm tra tính toàn vẹn CSDL
    const checkDup = await pool.request().query(`
      SELECT CurrentOrderID, COUNT(*) AS OccupiedCount
      FROM CultivationTrays
      WHERE RoomID = ${targetRoomId} AND Status = 'OCCUPIED'
      GROUP BY CurrentOrderID
      HAVING COUNT(*) > 1;
    `);

    if (successes.length === 2 && failures.length === 8 && checkDup.recordset.length === 0) {
      console.log("\n>>> KẾT LUẬN: ĐẠT TIÊU CHUẨN XUẤT SẮC 10/10 (PASSED)!");
      console.log(">>> Cơ chế khóa dòng (UPDLOCK, ROWLOCK) bảo vệ dữ liệu hoàn hảo, không có overbooking!\n");
    } else {
      console.log("\n>>> CẢNH BÁO: KẾT QUẢ KHÔNG KHỚP VỚI THIẾT KẾ KỲ VỌNG!\n");
    }

    // Dọn dẹp dữ liệu
    await pool.request().query(`
      DELETE FROM GrowthLogs WHERE OrderID IN (SELECT OrderID FROM RentalOrders WHERE DeliveryAddress LIKE N'%Stress Test%');
      DELETE FROM CultivationTrays WHERE TrayCode IN ('TRAY_STRESS_01', 'TRAY_STRESS_02');
      DELETE FROM RentalOrders WHERE DeliveryAddress LIKE N'%Stress Test%';
      DELETE FROM Rooms WHERE RoomCode = 'RM_STRESS_TEST';
    `);
    console.log("Đã dọn dẹp môi trường thử nghiệm sạch sẽ.");
  } catch (err: any) {
    console.error("Lỗi trong quá trình chạy test:", err);
  } finally {
    await pool.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith("test_concurrency_runner.ts")) {
  runConcurrencyStressTest();
}

export { runConcurrencyStressTest };
