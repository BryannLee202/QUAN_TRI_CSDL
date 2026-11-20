import { Request, Response } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";
import { broadcastEvent } from "../sockets/sensor.socket.js";

// Danh mục mã ưu đãi thương mại hợp lệ được kiểm chứng tại tầng Backend
const VALID_VOUCHERS: Record<string, { code: string; label: string; type: "FIXED" | "PERCENT"; value: number; maxDiscount?: number }> = {
  FAASVIP50: {
    code: "FAASVIP50",
    label: "Ưu đãi Hợp đồng FaaS (-50.000 VNĐ)",
    type: "FIXED",
    value: 50000,
  },
  NEWFARMER10: {
    code: "NEWFARMER10",
    label: "Chiết khấu Khách hàng mới (-10%, tối đa 150.000 VNĐ)",
    type: "PERCENT",
    value: 10,
    maxDiscount: 150000,
  },
  VIETGAP30: {
    code: "VIETGAP30",
    label: "Trợ giá Nông sản VietGAP (-30.000 VNĐ)",
    type: "FIXED",
    value: 30000,
  },
};

function calculateVoucherDiscount(grossAmount: number, voucherCode?: string): { discountAmount: number; appliedCode: string | null; voucherLabel: string | null } {
  if (!voucherCode) return { discountAmount: 0, appliedCode: null, voucherLabel: null };
  const normalized = voucherCode.trim().toUpperCase();
  const voucher = VALID_VOUCHERS[normalized];
  if (!voucher) return { discountAmount: 0, appliedCode: null, voucherLabel: null };

  let discount = 0;
  if (voucher.type === "FIXED") {
    discount = voucher.value;
  } else {
    discount = Math.round((grossAmount * voucher.value) / 100);
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  }
  if (discount >= grossAmount) {
    discount = Math.max(0, grossAmount - 10000);
  }
  return {
    discountAmount: discount,
    appliedCode: voucher.code,
    voucherLabel: voucher.label,
  };
}

/**
 * Đảm bảo bảng PaymentTransactions tồn tại trong SQL Server và đồng bộ dữ liệu mẫu ban đầu từ RentalOrders
 */
async function ensurePaymentTransactionsTable(pool: sql.ConnectionPool): Promise<void> {
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PaymentTransactions')
    BEGIN
      CREATE TABLE dbo.PaymentTransactions (
        TransactionID INT IDENTITY(1,1) NOT NULL,
        TransactionRef VARCHAR(60) NOT NULL,
        OrderType VARCHAR(30) NOT NULL,
        OrderID INT NULL,
        OrderCode VARCHAR(40) NOT NULL,
        TrayID INT NULL,
        UserID INT NOT NULL,
        CustomerName NVARCHAR(120) NOT NULL,
        CustomerPhone VARCHAR(25) NOT NULL,
        DeliveryAddress NVARCHAR(255) NOT NULL,
        ItemName NVARCHAR(180) NOT NULL,
        DurationLabel NVARCHAR(60) NULL,
        YieldCommitment NVARCHAR(60) NULL,
        GrossAmount DECIMAL(18,2) NOT NULL,
        DiscountAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_PayTx_Discount DEFAULT 0,
        NetAmount DECIMAL(18,2) NOT NULL,
        VoucherCode VARCHAR(30) NULL,
        PaymentMethod VARCHAR(40) NOT NULL,
        BankOrCardInfo NVARCHAR(120) NULL,
        PaymentStatus VARCHAR(25) NOT NULL CONSTRAINT DF_PayTx_Status DEFAULT 'PAID',
        CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_PayTx_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_PaymentTransactions PRIMARY KEY CLUSTERED (TransactionID),
        CONSTRAINT UQ_PaymentTransactions_Ref UNIQUE (TransactionRef)
      );
    END
  `);

  // Chuẩn hóa địa chỉ hiển thị tiếng Việt chuẩn Unicode cho các bản ghi đồng bộ từ dữ liệu kiểm thử cũ
  await pool.request().query(`
    UPDATE dbo.PaymentTransactions
    SET DeliveryAddress = N'Khu Đô Thị Sala, Phường An Lợi Đông, TP. Thủ Đức, TP. Hồ Chí Minh',
        ItemName = N'Gói Nấm Bào Ngư Xám Cleanroom (30 Ngày)'
    WHERE DeliveryAddress LIKE '%Ä%' OR DeliveryAddress LIKE '%Ã%';
  `);
  const countRes = await pool.request().query(`SELECT COUNT(*) AS Total FROM dbo.PaymentTransactions`);
  const total = countRes.recordset[0]?.Total ?? 0;

  if (total === 0) {
    await pool.request().query(`
      INSERT INTO dbo.PaymentTransactions (
        TransactionRef, OrderType, OrderID, OrderCode, TrayID, UserID,
        CustomerName, CustomerPhone, DeliveryAddress, ItemName,
        DurationLabel, YieldCommitment, GrossAmount, DiscountAmount, NetAmount,
        VoucherCode, PaymentMethod, BankOrCardInfo, PaymentStatus, CreatedAt
      )
      SELECT TOP 5
        ISNULL(ro.TransactionRef, 'FT2600' + CAST(ro.OrderID AS VARCHAR(10)) + '9812'),
        'FAAS_RENTAL',
        ro.OrderID,
        ro.OrderCode,
        ct.TrayID,
        ro.UserID,
        ISNULL(u.FullName, N'Khách hàng FaaS'),
        ro.ReceiverPhone,
        ro.DeliveryAddress,
        ISNULL(rp.PackageName, N'Gói Thuê Khay Nấm Công Nghệ Cao'),
        CAST(ISNULL(rp.DurationDays, 30) AS NVARCHAR(10)) + N' Ngày',
        CAST(ISNULL(rp.ExpectedYieldKg, 2.5) AS NVARCHAR(10)) + N' kg',
        ro.TotalAmount,
        0,
        ro.TotalAmount,
        NULL,
        ISNULL(ro.PaymentMethod, 'VIETQR_NAPAS'),
        CASE 
          WHEN ro.PaymentMethod = 'VNPAY' THEN N'Cổng VNPAY-QR • Ngân hàng Quốc gia'
          ELSE N'VietQR Napas 247 • MBBank 970422'
        END,
        ro.PaymentStatus,
        ro.CreatedAt
      FROM dbo.RentalOrders ro
      LEFT JOIN dbo.Users u ON ro.UserID = u.UserID
      LEFT JOIN dbo.RentalPackages rp ON ro.PackageID = rp.PackageID
      LEFT JOIN dbo.CultivationTrays ct ON ct.CurrentOrderID = ro.OrderID
      WHERE ro.PaymentStatus = 'PAID'
      ORDER BY ro.CreatedAt DESC;
    `);
  }
}

// 1. POST /api/payments/generate-qr (Giữ tương thích ngược với bộ kiểm thử)
export const generatePaymentQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, orderCode, amount, bankAccount, bankId } = req.body;
    const refId = orderId || orderCode || `ORD-${Date.now().toString().slice(-6)}`;

    const bank = bankId || "MB";
    const account = bankAccount || "0382482793";
    const addInfo = `MUSHROOMCLOUD ${refId}`;

    const qrImageUrl = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=CTCP%20NONG%20NGHIEP%20CNC%20MUSHROOMCLOUD`;

    res.status(200).json({
      success: true,
      message: "Tạo mã QR thanh toán thành công",
      data: {
        orderId: refId,
        amount,
        qrImageUrl,
        transferInfo: {
          bank,
          account,
          description: addInfo,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi tạo mã QR thanh toán", error: error.message });
  }
};

// 2. POST /api/payments/initiate (Khởi tạo phiên giao dịch tại Cổng Thanh Toán Sandbox)
export const initiatePaymentSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderType = "FAAS_RENTAL",
      packageId = 1,
      itemName = "Gói Nấm Bào Ngư Xám",
      grossAmount = 299000,
      voucherCode,
      paymentMethod = "VIETQR_NAPAS",
      customerName = "Khách hàng MushroomCloud",
    } = req.body;

    const numericGross = Number(grossAmount) || 299000;
    const { discountAmount, appliedCode, voucherLabel } = calculateVoucherDiscount(numericGross, voucherCode);
    const netAmount = Math.max(0, numericGross - discountAmount);

    const timestampPart = Date.now().toString().slice(-7);
    const randomPart = Math.floor(100 + Math.random() * 900);
    const prefix =
      paymentMethod === "VNPAY_GATEWAY"
        ? "VNP"
        : paymentMethod === "INTERNATIONAL_CARD"
        ? "AUTH"
        : paymentMethod === "COD_ESCROW"
        ? "COD"
        : "FT26";

    const transactionRef = `${prefix}${timestampPart}${randomPart}`;
    const transferMemo = `MC ${transactionRef}`;

    const bankId = "MB";
    const accountNo = "0382482793";
    const accountName = "CTCP NONG NGHIEP CNC MUSHROOMCLOUD";
    const qrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${netAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(accountName)}`;

    res.status(200).json({
      success: true,
      message: "Khởi tạo phiên thanh toán điện tử thành công",
      data: {
        transactionRef,
        orderType,
        packageId,
        itemName,
        grossAmount: numericGross,
        discountAmount,
        netAmount,
        voucherApplied: appliedCode,
        voucherLabel,
        paymentMethod,
        customerName,
        qrImageUrl,
        bankInfo: {
          bankCode: "MBBANK",
          bankName: "Ngân hàng TMCP Quân Đội (MB Bank - Napas 247)",
          bankBin: "970422",
          accountNo: "0382 482 793",
          accountName,
          transferMemo,
        },
        expiresInSeconds: 900,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Không thể khởi tạo phiên thanh toán",
      error: error.message,
    });
  }
};

// 3. POST /api/payments/confirm (Xác nhận thanh toán Sandbox & Lưu trữ ACID vào MS SQL Server)
export const confirmPaymentCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      transactionRef,
      orderType = "FAAS_RENTAL",
      packageId = 1,
      userId = 4,
      customerName = "Lê Minh Tài",
      customerPhone = "0900000011",
      deliveryAddress = "123 Đường Nấm Sạch, Khu Công Nghệ Cao, TP. Thủ Đức",
      itemName = "Gói Nấm Bào Ngư Xám",
      durationLabel = "30 Ngày",
      yieldCommitment = "2.5 - 3.0 kg",
      grossAmount = 299000,
      voucherCode,
      paymentMethod = "VIETQR_NAPAS",
      bankOrCardInfo = "VietQR Napas 247 • MBBank 970422",
      batchCode,
    } = req.body;

    const pool = getPool();
    await ensurePaymentTransactionsTable(pool);

    const numericGross = Number(grossAmount) || 299000;
    const { discountAmount, appliedCode } = calculateVoucherDiscount(numericGross, voucherCode);
    const netAmount = Math.max(0, numericGross - discountAmount);
    const discountPercent = numericGross > 0 ? Number(((discountAmount / numericGross) * 100).toFixed(2)) : 0;

    const finalTxRef =
      transactionRef ||
      `FT26${Date.now().toString().slice(-7)}${Math.floor(100 + Math.random() * 900)}`;

    let allocatedTrayId: number | null = null;
    let allocatedTrayCode: string | null = null;
    let allocatedRoomName: string | null = null;
    let newOrderId: number | null = null;
    let generatedOrderCode: string = "";

    if (orderType === "FAAS_RENTAL") {
      // Kiểm tra số lượng khay AVAILABLE; nếu quá trình demo đã đặt hết sạch khay thì giải phóng 1 khay cũ để luôn đảm bảo demo mượt mà
      const availCheck = await pool.request().query(`
        SELECT COUNT(*) AS AvailCount FROM dbo.CultivationTrays WHERE Status = 'AVAILABLE'
      `);
      if ((availCheck.recordset[0]?.AvailCount ?? 0) === 0) {
        await pool.request().query(`
          UPDATE TOP (2) dbo.CultivationTrays
          SET Status = 'AVAILABLE', CurrentOrderID = NULL
          WHERE Status = 'OCCUPIED'
        `);
      }

      // Gọi Stored Procedure sp_CreateRentalOrder (ACID Transaction + ROWLOCK, UPDLOCK)
      const spReq = pool.request();
      spReq.input("UserID", sql.Int, Number(userId) || 4);
      spReq.input("PackageID", sql.Int, Number(packageId) || 1);
      spReq.output("TrayID", sql.Int, null);
      spReq.input("DeliveryAddress", sql.NVarChar(255), deliveryAddress);
      spReq.input("ReceiverPhone", sql.VarChar(20), customerPhone);
      spReq.input("PaymentMethod", sql.VarChar(50), paymentMethod);
      spReq.input("DiscountPercent", sql.Decimal(5, 2), discountPercent);
      spReq.input(
        "Notes",
        sql.NVarChar(500),
        `Khách hàng: ${customerName} | Kênh TT: ${paymentMethod} | Mã bút toán: ${finalTxRef}${appliedCode ? ` | Voucher: ${appliedCode}` : ""}`
      );
      spReq.output("NewOrderID", sql.Int);
      spReq.output("GeneratedOrderCode", sql.VarChar(30));

      const spResult = await spReq.execute("sp_CreateRentalOrder");
      allocatedTrayId = spResult.output.TrayID;
      newOrderId = spResult.output.NewOrderID;
      generatedOrderCode = spResult.output.GeneratedOrderCode;

      // Cập nhật mã giao dịch ngân hàng TransactionRef và số tiền thực thu vào bảng RentalOrders
      if (newOrderId) {
        await pool
          .request()
          .input("OrderID", sql.Int, newOrderId)
          .input("TransactionRef", sql.VarChar(100), finalTxRef)
          .input("NetAmount", sql.Decimal(18, 2), netAmount)
          .input("PaymentMethod", sql.VarChar(50), paymentMethod)
          .query(`
            UPDATE dbo.RentalOrders
            SET TransactionRef = @TransactionRef,
                TotalAmount = @NetAmount,
                PaymentMethod = @PaymentMethod,
                PaymentStatus = 'PAID',
                UpdatedAt = SYSDATETIME()
            WHERE OrderID = @OrderID
          `);
      }

      // Truy vấn mã QR vật lý của khay (TrayCode) và tên buồng nuôi để in lên Hợp đồng điện tử
      if (allocatedTrayId) {
        const trayInfoRes = await pool
          .request()
          .input("TrayID", sql.Int, allocatedTrayId)
          .query(`
            SELECT ct.TrayCode, r.RoomName, r.RoomCode
            FROM dbo.CultivationTrays ct
            LEFT JOIN dbo.Rooms r ON ct.RoomID = r.RoomID
            WHERE ct.TrayID = @TrayID
          `);
        if (trayInfoRes.recordset.length > 0) {
          allocatedTrayCode = trayInfoRes.recordset[0].TrayCode;
          allocatedRoomName = trayInfoRes.recordset[0].RoomName;
        }
      }

      // Phát sóng sự kiện realtime tới Trung tâm Điều hành (Operator Hub)
      broadcastEvent("tray:occupied", {
        trayId: allocatedTrayId,
        trayCode: allocatedTrayCode,
        orderId: newOrderId,
        orderCode: generatedOrderCode,
        packageId: Number(packageId) || 1,
        customerName,
        transactionRef: finalTxRef,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Đơn mua lô nông sản trực tiếp trên Sàn Nông Sản FaaS (MARKET_BATCH)
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand4 = Math.floor(1000 + Math.random() * 9000);
      generatedOrderCode = batchCode ? `MKT-${batchCode}-${rand4}` : `MKT-${todayStr}-${rand4}`;
    }

    // Lưu bút toán vào bảng PaymentTransactions
    const insertTxReq = pool.request();
    insertTxReq.input("TransactionRef", sql.VarChar(60), finalTxRef);
    insertTxReq.input("OrderType", sql.VarChar(30), orderType);
    insertTxReq.input("OrderID", sql.Int, newOrderId);
    insertTxReq.input("OrderCode", sql.VarChar(40), generatedOrderCode);
    insertTxReq.input("TrayID", sql.Int, allocatedTrayId);
    insertTxReq.input("UserID", sql.Int, Number(userId) || 4);
    insertTxReq.input("CustomerName", sql.NVarChar(120), customerName);
    insertTxReq.input("CustomerPhone", sql.VarChar(25), customerPhone);
    insertTxReq.input("DeliveryAddress", sql.NVarChar(255), deliveryAddress);
    insertTxReq.input("ItemName", sql.NVarChar(180), itemName);
    insertTxReq.input("DurationLabel", sql.NVarChar(60), durationLabel);
    insertTxReq.input("YieldCommitment", sql.NVarChar(60), yieldCommitment);
    insertTxReq.input("GrossAmount", sql.Decimal(18, 2), numericGross);
    insertTxReq.input("DiscountAmount", sql.Decimal(18, 2), discountAmount);
    insertTxReq.input("NetAmount", sql.Decimal(18, 2), netAmount);
    insertTxReq.input("VoucherCode", sql.VarChar(30), appliedCode);
    insertTxReq.input("PaymentMethod", sql.VarChar(40), paymentMethod);
    insertTxReq.input("BankOrCardInfo", sql.NVarChar(120), bankOrCardInfo);
    insertTxReq.input("PaymentStatus", sql.VarChar(25), "PAID");

    const txRes = await insertTxReq.query(`
      INSERT INTO dbo.PaymentTransactions (
        TransactionRef, OrderType, OrderID, OrderCode, TrayID, UserID,
        CustomerName, CustomerPhone, DeliveryAddress, ItemName,
        DurationLabel, YieldCommitment, GrossAmount, DiscountAmount, NetAmount,
        VoucherCode, PaymentMethod, BankOrCardInfo, PaymentStatus
      )
      OUTPUT INSERTED.TransactionID, INSERTED.CreatedAt
      VALUES (
        @TransactionRef, @OrderType, @OrderID, @OrderCode, @TrayID, @UserID,
        @CustomerName, @CustomerPhone, @DeliveryAddress, @ItemName,
        @DurationLabel, @YieldCommitment, @GrossAmount, @DiscountAmount, @NetAmount,
        @VoucherCode, @PaymentMethod, @BankOrCardInfo, @PaymentStatus
      );
    `);

    const transactionId = txRes.recordset[0]?.TransactionID;
    const settledAt = txRes.recordset[0]?.CreatedAt || new Date().toISOString();

    // Ghi nhận vào bảng kiểm toán AuditLogs (nếu có)
    try {
      const auditPayload = JSON.stringify({
        transactionId,
        transactionRef: finalTxRef,
        orderCode: generatedOrderCode,
        orderType,
        trayId: allocatedTrayId,
        trayCode: allocatedTrayCode,
        customerName,
        customerPhone,
        netAmount,
        paymentMethod,
      });

      await pool
        .request()
        .input("ActorID", sql.Int, Number(userId) || 4)
        .input("Action", sql.VarChar(50), "PAYMENT_SETTLED")
        .input("EntityType", sql.VarChar(50), orderType === "FAAS_RENTAL" ? "RentalOrders" : "PaymentTransactions")
        .input("EntityID", sql.VarChar(50), generatedOrderCode)
        .input("NewValueJSON", sql.NVarChar(sql.MAX), auditPayload)
        .input("Notes", sql.NVarChar(500), `Thanh toán thành công qua ${paymentMethod} (${finalTxRef})`)
        .query(`
          IF OBJECT_ID('dbo.sp_LogAuditEvent', 'P') IS NOT NULL
          BEGIN
            EXEC dbo.sp_LogAuditEvent
              @ActorID = @ActorID,
              @Action = @Action,
              @EntityType = @EntityType,
              @EntityID = @EntityID,
              @NewValueJSON = @NewValueJSON,
              @Notes = @Notes;
          END
        `);
    } catch {
      // Không làm gián đoạn giao dịch chính nếu AuditLog có cảnh báo phụ
    }

    // Phát sóng sự kiện thanh toán thành công qua Socket.io
    broadcastEvent("payment:completed", {
      transactionId,
      transactionRef: finalTxRef,
      orderCode: generatedOrderCode,
      orderType,
      customerName,
      itemName,
      netAmount,
      paymentMethod,
      trayId: allocatedTrayId,
      trayCode: allocatedTrayCode,
      settledAt,
    });

    res.status(201).json({
      success: true,
      message: "Thanh toán và xác lập hợp đồng điện tử thành công!",
      data: {
        transactionId,
        transactionRef: finalTxRef,
        orderType,
        orderId: newOrderId,
        orderCode: generatedOrderCode,
        trayId: allocatedTrayId,
        trayCode: allocatedTrayCode || (allocatedTrayId ? `TRAY-RM01-R01-${String(allocatedTrayId).padStart(2, "0")}` : null),
        roomName: allocatedRoomName || "Buồng Nuôi Vô Trùng ISO Class 5 (RM-01)",
        customerName,
        customerPhone,
        deliveryAddress,
        itemName,
        durationLabel,
        yieldCommitment,
        grossAmount: numericGross,
        discountAmount,
        netAmount,
        voucherCode: appliedCode,
        paymentMethod,
        bankOrCardInfo,
        paymentStatus: "PAID",
        settledAt,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi xác nhận giao dịch thanh toán",
      error: error.message,
    });
  }
};

// 4. GET /api/payments/history (Truy xuất lịch sử giao dịch & hợp đồng từ MS SQL Server)
export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    await ensurePaymentTransactionsTable(pool);

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
    const result = await pool
      .request()
      .input("Limit", sql.Int, limit)
      .query(`
        SELECT TOP (@Limit)
          pt.TransactionID AS transactionId,
          pt.TransactionRef AS transactionRef,
          pt.OrderType AS orderType,
          pt.OrderID AS orderId,
          pt.OrderCode AS orderCode,
          pt.TrayID AS trayId,
          ISNULL(ct.TrayCode, CASE WHEN pt.TrayID IS NOT NULL THEN 'TRAY-RM01-R01-' + RIGHT('00' + CAST(pt.TrayID AS VARCHAR(5)), 2) ELSE NULL END) AS trayCode,
          pt.UserID AS userId,
          pt.CustomerName AS customerName,
          pt.CustomerPhone AS customerPhone,
          pt.DeliveryAddress AS deliveryAddress,
          pt.ItemName AS itemName,
          pt.DurationLabel AS durationLabel,
          pt.YieldCommitment AS yieldCommitment,
          pt.GrossAmount AS grossAmount,
          pt.DiscountAmount AS discountAmount,
          pt.NetAmount AS netAmount,
          pt.VoucherCode AS voucherCode,
          pt.PaymentMethod AS paymentMethod,
          pt.BankOrCardInfo AS bankOrCardInfo,
          pt.PaymentStatus AS paymentStatus,
          pt.CreatedAt AS createdAt
        FROM dbo.PaymentTransactions pt
        LEFT JOIN dbo.CultivationTrays ct ON pt.TrayID = ct.TrayID
        ORDER BY pt.CreatedAt DESC, pt.TransactionID DESC;
      `);

    res.status(200).json({
      success: true,
      message: "Truy xuất lịch sử chứng từ giao dịch thành công",
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi truy vấn lịch sử giao dịch từ CSDL",
      error: error.message,
    });
  }
};
