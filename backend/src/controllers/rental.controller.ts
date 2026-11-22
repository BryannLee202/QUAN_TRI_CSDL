import { Request, Response } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";
import { broadcastEvent } from "../sockets/sensor.socket.js";

// 1. POST /api/rentals (Tạo đơn thuê khay nấm an toàn - gọi sp_CreateRentalOrder)
export const createRental = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, packageId, trayId, deliveryAddress, receiverPhone, paymentMethod, discountPercent, notes } = req.body;

    // Xác thực an toàn đầu vào (Phòng thủ SQL Injection & Boundary Attacks)
    if (userId !== undefined && (isNaN(Number(userId)) || Number(userId) <= 0)) {
      res.status(400).json({ success: false, message: "ID người dùng (userId) không hợp lệ." });
      return;
    }
    if (packageId !== undefined && (isNaN(Number(packageId)) || Number(packageId) <= 0)) {
      res.status(400).json({ success: false, message: "ID gói nấm (packageId) không hợp lệ." });
      return;
    }
    if (trayId !== undefined && trayId !== null && (isNaN(Number(trayId)) || Number(trayId) <= 0)) {
      res.status(400).json({ success: false, message: "ID khay nấm (trayId) không hợp lệ." });
      return;
    }

    const pool = getPool();
    const request = pool.request();
    request.input("UserID", sql.Int, userId || 4); // Mặc định customer1 nếu không truyền
    request.input("PackageID", sql.Int, packageId || 1);
    request.output("TrayID", sql.Int, trayId || null);
    request.input("DeliveryAddress", sql.NVarChar(255), deliveryAddress || "123 Đường Nấm Sạch, TP. Hồ Chí Minh");
    request.input("ReceiverPhone", sql.VarChar(20), receiverPhone || "0900000011");
    request.input("PaymentMethod", sql.VarChar(50), paymentMethod || "VNPAY");
    request.input("DiscountPercent", sql.Decimal(5, 2), discountPercent || 0.00);
    request.input("Notes", sql.NVarChar(500), notes || "Đơn đặt thuê từ Web API");
    request.output("NewOrderID", sql.Int);
    request.output("GeneratedOrderCode", sql.VarChar(30));

    const result = await request.execute("sp_CreateRentalOrder");

    const allocatedTrayId = result.output.TrayID || trayId;
    const newOrderId = result.output.NewOrderID;
    const orderCode = result.output.GeneratedOrderCode;

    // Phát sóng sự kiện realtime tới trang Operator
    broadcastEvent("tray:occupied", {
      trayId: allocatedTrayId,
      orderId: newOrderId,
      orderCode: orderCode,
      packageId: packageId || 1,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: "Đặt thuê khay nấm thành công!",
      data: {
        orderId: newOrderId,
        orderCode: orderCode,
        trayId: allocatedTrayId,
      },
    });
  } catch (error: any) {
    const isConflict = error.message && (error.message.includes("không còn khay") || error.message.includes("AVAILABLE"));
    const statusCode = isConflict ? 409 : 400;
    res.status(statusCode).json({ success: false, message: error.message || "Lỗi xử lý thuê khay", error: error.message });
  }
};

// 2. POST /api/trays/assign-qr (Gán khay nấm bằng mã QR - gọi sp_AssignTrayToOrder)
export const assignTrayQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, qrCode, operatorId } = req.body;

    const pool = getPool();
    const request = pool.request();
    request.input("OrderID", sql.Int, orderId);
    request.input("TrayCode", sql.VarChar(50), qrCode);
    request.input("OperatorID", sql.Int, operatorId || 2);

    await request.execute("sp_AssignTrayToOrder");

    res.status(200).json({
      message: "Gán khay nấm qua QR thành công!",
      data: { orderId, qrCode },
    });
  } catch (error: any) {
    const isNotFound = error.message && error.message.includes("không tồn tại");
    const statusCode = isNotFound ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message || "Lỗi gán khay QR", error: error.message });
  }
};

// 3. POST /api/harvest (Gửi yêu cầu thu hoạch - gọi sp_RequestHarvest)
export const requestHarvest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, deliveryType, deliveryAddress, notes } = req.body;

    const pool = getPool();
    const request = pool.request();
    request.input("OrderID", sql.Int, orderId);
    request.input("DeliveryType", sql.VarChar(20), deliveryType || "HOME_DELIVERY");
    request.input("DeliveryAddress", sql.NVarChar(255), deliveryAddress || null);
    request.input("Notes", sql.NVarChar(500), notes || null);
    request.output("NewHarvestID", sql.Int);

    const result = await request.execute("sp_RequestHarvest");
    const harvestId = result.output.NewHarvestID;

    // Phát sóng sự kiện realtime yêu cầu thu hoạch tới trang Operator
    broadcastEvent("harvest:requested", {
      harvestId,
      orderId,
      deliveryType: deliveryType || "HOME_DELIVERY",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Gửi yêu cầu thu hoạch thành công!",
      data: {
        harvestId,
        orderId,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Lỗi yêu cầu thu hoạch", error: error.message });
  }
};

// 4. POST /api/harvest/complete (Kỹ thuật viên nghiệm thu sản lượng - gọi sp_CompleteHarvest)
export const completeHarvest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { harvestId, actualWeightKg, qualityGrade, trackingNumber, operatorId } = req.body;

    const pool = getPool();
    const request = pool.request();
    request.input("HarvestID", sql.Int, harvestId);
    request.input("ActualWeightKg", sql.Decimal(5, 2), actualWeightKg || 2.5);
    request.input("QualityGrade", sql.NVarChar(20), qualityGrade || "Loại A");
    request.input("TrackingNumber", sql.VarChar(50), trackingNumber || "VNPOST-MUSH-01");
    request.input("OperatorID", sql.Int, operatorId || 2);

    await request.execute("sp_CompleteHarvest");

    res.status(200).json({
      message: "Nghiệm thu hoàn tất thu hoạch thành công!",
      data: { harvestId, actualWeightKg, qualityGrade },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Lỗi hoàn tất thu hoạch", error: error.message });
  }
};

// 5. GET /api/rentals/my-trays (Lấy danh sách khay nấm & tình trạng sinh trưởng của riêng khách hàng đang đăng nhập)
export const getMyTrays = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as any).user;
    if (!authUser || !authUser.userId) {
      res.status(401).json({ success: false, message: "Vui lòng đăng nhập để xem khay nấm của bạn." });
      return;
    }

    const pool = getPool();
    const result = await pool
      .request()
      .input("UserID", sql.Int, Number(authUser.userId))
      .query(`
        SELECT
          o.OrderID AS orderId,
          o.OrderCode AS orderCode,
          o.StartDate AS startDate,
          o.EndDate AS endDate,
          o.TotalAmount AS totalAmount,
          o.PaymentStatus AS paymentStatus,
          o.DeliveryAddress AS deliveryAddress,
          o.CreatedAt AS createdAt,
          p.PackageID AS packageId,
          p.PackageName AS packageName,
          p.DurationDays AS durationDays,
          p.ExpectedYieldKg AS expectedYieldKg,
          sp.SpeciesID AS speciesId,
          sp.SpeciesName AS speciesName,
          sp.ScientificName AS scientificName,
          sp.OptimalTempMin AS optimalTempMin,
          sp.OptimalTempMax AS optimalTempMax,
          sp.OptimalHumidityMin AS optimalHumidityMin,
          sp.OptimalHumidityMax AS optimalHumidityMax,
          sp.OptimalCO2Max AS optimalCO2Max,
          t.TrayID AS trayId,
          t.TrayCode AS trayCode,
          t.RackNumber AS rackNumber,
          t.ShelfLevel AS shelfLevel,
          t.PositionNumber AS positionNumber,
          t.Status AS trayStatus,
          t.InoculationDate AS inoculationDate,
          t.ExpectedHarvestDate AS expectedHarvestDate,
          r.RoomID AS roomId,
          r.RoomCode AS roomCode,
          r.RoomName AS roomName,
          ISNULL(s.Temperature, 23.8) AS temperature,
          ISNULL(s.Humidity, 89.5) AS humidity,
          ISNULL(s.CO2Level, 610) AS co2Level,
          ISNULL(s.LightLux, 480) AS lightLux,
          s.RecordedAt AS sensorRecordedAt,
          h.HarvestID AS harvestId,
          h.Status AS harvestStatus,
          h.RequestDate AS harvestRequestDate
        FROM dbo.RentalOrders o
        INNER JOIN dbo.RentalPackages p ON o.PackageID = p.PackageID
        INNER JOIN dbo.MushroomSpecies sp ON p.SpeciesID = sp.SpeciesID
        LEFT JOIN dbo.CultivationTrays t ON t.CurrentOrderID = o.OrderID
        LEFT JOIN dbo.Rooms r ON t.RoomID = r.RoomID
        OUTER APPLY (
          SELECT TOP 1 sd.Temperature, sd.Humidity, sd.CO2Level, sd.LightLux, sd.RecordedAt
          FROM dbo.SensorData sd
          WHERE sd.RoomID = r.RoomID
          ORDER BY sd.RecordedAt DESC
        ) s
        OUTER APPLY (
          SELECT TOP 1 hr.HarvestID, hr.Status, hr.RequestDate
          FROM dbo.HarvestRequests hr
          WHERE hr.OrderID = o.OrderID
          ORDER BY hr.RequestDate DESC
        ) h
        WHERE o.UserID = @UserID
          AND o.PaymentStatus <> 'CANCELLED'
        ORDER BY o.CreatedAt DESC;
      `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Không thể tải danh sách khay nấm của bạn.",
    });
  }
};
