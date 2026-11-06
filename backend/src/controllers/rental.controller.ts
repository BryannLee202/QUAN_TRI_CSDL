import { Request, Response } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";

// 1. POST /api/rentals (Tạo đơn thuê khay nấm an toàn - gọi sp_CreateRentalOrder)
export const createRental = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, packageId, trayId, deliveryAddress, receiverPhone, paymentMethod, discountPercent, notes } = req.body;

    const pool = getPool();
    
    // Nếu không truyền trayId cụ thể, tự động tìm khay AVAILABLE đầu tiên trong hệ thống
    let targetTrayId = trayId;
    if (!targetTrayId) {
      const trayResult = await pool.request().query("SELECT TOP 1 TrayID FROM CultivationTrays WHERE Status = 'AVAILABLE' ORDER BY TrayID");
      if (trayResult.recordset.length > 0) {
        targetTrayId = trayResult.recordset[0].TrayID;
      } else {
        res.status(400).json({ message: "Hiện không còn khay nấm nào ở trạng thái AVAILABLE để đặt thuê!" });
        return;
      }
    }

    const request = pool.request();
    request.input("UserID", sql.Int, userId || 4); // Mặc định customer1 nếu không truyền
    request.input("PackageID", sql.Int, packageId || 1);
    request.input("TrayID", sql.Int, targetTrayId);
    request.input("DeliveryAddress", sql.NVarChar(255), deliveryAddress || "123 Đường Nấm Sạch, TP. Hồ Chí Minh");
    request.input("ReceiverPhone", sql.VarChar(20), receiverPhone || "0900000011");
    request.input("PaymentMethod", sql.VarChar(50), paymentMethod || "VNPAY");
    request.input("DiscountPercent", sql.Decimal(5, 2), discountPercent || 0.00);
    request.input("Notes", sql.NVarChar(500), notes || "Đơn đặt thuê từ Web API");
    request.output("NewOrderID", sql.Int);
    request.output("GeneratedOrderCode", sql.VarChar(30));

    const result = await request.execute("sp_CreateRentalOrder");

    res.status(201).json({
      message: "Đặt thuê khay nấm thành công!",
      data: {
        orderId: result.output.NewOrderID,
        orderCode: result.output.GeneratedOrderCode,
        trayId: targetTrayId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi xử lý thuê khay", error: error.message });
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
    res.status(500).json({ message: "Lỗi gán khay QR", error: error.message });
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

    res.status(200).json({
      message: "Gửi yêu cầu thu hoạch thành công!",
      data: {
        harvestId: result.output.NewHarvestID,
        orderId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi yêu cầu thu hoạch", error: error.message });
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
    res.status(500).json({ message: "Lỗi hoàn tất thu hoạch", error: error.message });
  }
};
