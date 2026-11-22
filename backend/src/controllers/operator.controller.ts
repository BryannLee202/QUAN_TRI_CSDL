import { Request, Response } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";
import { broadcastEvent } from "../sockets/sensor.socket.js";

/**
 * Operator Controller - Quản lý trung tâm điều hành trang trại nấm
 * Cung cấp API trực tiếp cho Kỹ thuật viên (Operator Hub) thao tác với SQL Server
 */

// 1. GET /api/operator/rooms - Danh sách buồng nuôi và công suất khay
export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        r.RoomID as roomId,
        r.RoomCode as roomCode,
        r.RoomName as roomName,
        r.MaxTrays as maxTrays,
        r.TempMin as tempMin,
        r.TempMax as tempMax,
        r.HumidityMin as humidityMin,
        r.HumidityMax as humidityMax,
        r.CO2Max as co2Max,
        COUNT(t.TrayID) as totalTrays,
        SUM(CASE WHEN t.Status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupiedTrays,
        SUM(CASE WHEN t.Status = 'AVAILABLE' THEN 1 ELSE 0 END) as availableTrays,
        SUM(CASE WHEN t.Status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenanceTrays
      FROM Rooms r
      LEFT JOIN CultivationTrays t ON r.RoomID = t.RoomID
      WHERE r.IsActive = 1
      GROUP BY r.RoomID, r.RoomCode, r.RoomName, r.MaxTrays, r.TempMin, r.TempMax, r.HumidityMin, r.HumidityMax, r.CO2Max
      ORDER BY r.RoomID ASC
    `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "GET_ROOMS_ERROR", message: error.message || "Lỗi truy vấn buồng nuôi CSDL" },
    });
  }
};

// 2. GET /api/operator/trays - Ma trận khay nuôi vật lý theo buồng
export const getTrays = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = req.query.roomId ? Number(req.query.roomId) : null;
    const pool = getPool();

    // Chỉ chuẩn hóa định danh 3 chữ số (ví dụ TRAY-RM01-R03-029) khi có bản ghi cũ chưa chuẩn, tránh Write-Lock trên mỗi lệnh GET
    await pool.request().query(`
      IF EXISTS (SELECT 1 FROM dbo.CultivationTrays WITH (NOLOCK) WHERE LEN(TrayCode) < 17)
      BEGIN
        WITH RankedTrays AS (
          SELECT 
            t.TrayID,
            t.TrayCode,
            r.RoomCode,
            t.RackNumber,
            ROW_NUMBER() OVER (PARTITION BY t.RoomID ORDER BY t.TrayID ASC) AS SeqNum
          FROM dbo.CultivationTrays t
          JOIN dbo.Rooms r ON t.RoomID = r.RoomID
        )
        UPDATE dbo.CultivationTrays
        SET TrayCode = CONCAT('TRAY-', rt.RoomCode, '-R', FORMAT(rt.RackNumber, '00'), '-', FORMAT(rt.SeqNum, '000'))
        FROM dbo.CultivationTrays ct
        JOIN RankedTrays rt ON ct.TrayID = rt.TrayID
        WHERE LEN(ct.TrayCode) < 17;
      END
    `);

    const request = pool.request();

    let query = `
      SELECT 
        t.TrayID as trayId,
        t.TrayCode as trayCode,
        t.RoomID as roomId,
        t.RackNumber as rackNumber,
        t.ShelfLevel as shelfLevel,
        t.PositionNumber as positionNumber,
        t.Status as status,
        t.CurrentOrderID as currentOrderId,
        o.OrderCode as orderCode,
        u.FullName as customerName,
        s.SpeciesName as speciesName,
        t.InoculationDate as inoculationDate,
        t.ExpectedHarvestDate as expectedHarvestDate
      FROM CultivationTrays t
      LEFT JOIN RentalOrders o ON t.CurrentOrderID = o.OrderID
      LEFT JOIN Users u ON o.UserID = u.UserID
      LEFT JOIN RentalPackages p ON o.PackageID = p.PackageID
      LEFT JOIN MushroomSpecies s ON p.SpeciesID = s.SpeciesID
    `;

    if (roomId) {
      query += ` WHERE t.RoomID = @RoomID`;
      request.input("RoomID", sql.Int, roomId);
    }

    query += ` ORDER BY t.RackNumber ASC, t.ShelfLevel ASC, t.PositionNumber ASC`;

    const result = await request.query(query);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "GET_TRAYS_ERROR", message: error.message || "Lỗi truy vấn ma trận khay CSDL" },
    });
  }
};

// 3. GET /api/operator/alerts - Danh sách cảnh báo vi khí hậu thời gian thực
export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = req.query.roomId ? Number(req.query.roomId) : null;
    const pool = getPool();
    const request = pool.request();

    let query = `
      SELECT TOP 50
        a.AlertID as alertId,
        a.RoomID as roomId,
        r.RoomCode as roomCode,
        a.TrayID as trayId,
        a.AlertType as alertType,
        a.Severity as severity,
        a.Message as message,
        a.AlertTime as alertTime,
        a.IsResolved as isResolved,
        a.ResolvedAt as resolvedAt,
        a.ResolvedNotes as resolvedNotes
      FROM SensorAlerts a
      JOIN Rooms r ON a.RoomID = r.RoomID
    `;

    if (roomId) {
      query += ` WHERE a.RoomID = @RoomID`;
      request.input("RoomID", sql.Int, roomId);
    }

    query += ` ORDER BY a.IsResolved ASC, a.AlertTime DESC`;

    const result = await request.query(query);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "GET_ALERTS_ERROR", message: error.message || "Lỗi truy vấn cảnh báo CSDL" },
    });
  }
};

// 4. POST /api/operator/alerts/:alertId/resolve - Giải quyết cảnh báo vi khí hậu
export const resolveAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alertId = Number(req.params.alertId);
    const { notes } = req.body;

    const pool = getPool();
    const request = pool.request();
    request.input("AlertID", sql.Int, alertId);
    request.input("Notes", sql.NVarChar(255), notes || "Đã giải quyết bởi kỹ thuật viên trang trại");

    await request.query(`
      UPDATE SensorAlerts
      SET IsResolved = 1, ResolvedAt = SYSDATETIME(), ResolvedNotes = @Notes
      WHERE AlertID = @AlertID
    `);

    // Phát sóng WebSocket cập nhật tức thời
    broadcastEvent("alert:resolved", { alertId, resolvedAt: new Date().toISOString() });

    res.status(200).json({
      success: true,
      message: `Đã xác nhận giải quyết cảnh báo #${alertId} thành công trong CSDL.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "RESOLVE_ALERT_ERROR", message: error.message || "Lỗi cập nhật trạng thái cảnh báo" },
    });
  }
};

// 5. POST /api/operator/devices/toggle - Điều khiển cưỡng bức thiết bị phần cứng
export const toggleDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, deviceType, actionState, triggeredBy, details } = req.body;

    if (!roomId || !deviceType || !actionState) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_PARAMS", message: "Thiếu thông tin roomId, deviceType hoặc actionState" },
      });
      return;
    }

    const pool = getPool();
    const request = pool.request();
    request.input("RoomID", sql.Int, roomId);
    request.input("DeviceType", sql.VarChar(50), deviceType);
    request.input("ActionState", sql.VarChar(20), actionState);
    request.input("TriggeredBy", sql.NVarChar(100), triggeredBy || "OPERATOR_MANUAL");
    request.input("Details", sql.NVarChar(500), details || `Chuyển trạng thái sang ${actionState}`);

    const result = await request.query(`
      INSERT INTO DeviceActionLogs (RoomID, DeviceType, ActionState, TriggeredBy, Details)
      OUTPUT INSERTED.ActionID, INSERTED.ExecutedAt
      VALUES (@RoomID, @DeviceType, @ActionState, @TriggeredBy, @Details)
    `);

    const inserted = result.recordset[0];

    // Phát sóng sự kiện qua Socket.io
    broadcastEvent("device:action", {
      actionId: inserted.ActionID,
      roomId,
      deviceType,
      actionState,
      triggeredBy: triggeredBy || "OPERATOR_MANUAL",
      executedAt: inserted.ExecutedAt,
    });

    res.status(200).json({
      success: true,
      data: {
        actionId: inserted.ActionID,
        roomId,
        deviceType,
        actionState,
        executedAt: inserted.ExecutedAt,
      },
      message: `Đã thực thi lệnh điều khiển ${deviceType} (${actionState}) và lưu nhật ký CSDL.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "TOGGLE_DEVICE_ERROR", message: error.message || "Lỗi ghi nhận nhật ký điều khiển thiết bị" },
    });
  }
};

// 6. POST /api/operator/trays/:trayId/status - Thay đổi trạng thái khay (Bảo trì / Sẵn sàng)
export const updateTrayStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const trayId = Number(req.params.trayId);
    const { status } = req.body;

    if (!["AVAILABLE", "MAINTENANCE"].includes(status)) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_STATUS", message: "Trạng thái chỉ có thể là AVAILABLE hoặc MAINTENANCE" },
      });
      return;
    }

    const pool = getPool();
    const request = pool.request();
    request.input("TrayID", sql.Int, trayId);
    request.input("Status", sql.VarChar(20), status);

    await request.query(`
      UPDATE CultivationTrays
      SET Status = @Status, LastCleanedAt = CASE WHEN @Status = 'AVAILABLE' THEN SYSDATETIME() ELSE LastCleanedAt END
      WHERE TrayID = @TrayID AND Status != 'OCCUPIED'
    `);

    broadcastEvent("tray:updated", { trayId, status, updatedAt: new Date().toISOString() });

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái khay #${trayId} sang ${status}.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_TRAY_ERROR", message: error.message || "Lỗi cập nhật trạng thái khay" },
    });
  }
};

// 7. POST /api/operator/trays/create - Tạo thêm khay nuôi mới (Đơn lẻ hoặc Hàng loạt) khi trang trại kín khay
export const createNewTrays = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = Number(req.body.roomId) || 1;
    const count = Math.min(20, Math.max(1, Number(req.body.count) || 1));
    const customRack = req.body.rackNumber ? Number(req.body.rackNumber) : null;
    const customShelf = req.body.shelfLevel ? Number(req.body.shelfLevel) : null;
    const initialStatus = ["AVAILABLE", "MAINTENANCE"].includes(req.body.status)
      ? req.body.status
      : "AVAILABLE";

    const pool = getPool();

    // 1. Lấy mã buồng (RM01, RM02...) và danh sách khay hiện có trong buồng
    const roomRes = await pool
      .request()
      .input("RoomID", sql.Int, roomId)
      .query(`SELECT RoomID, RoomCode, RoomName, MaxTrays FROM dbo.Rooms WHERE RoomID = @RoomID`);

    if (roomRes.recordset.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: "ROOM_NOT_FOUND", message: "Không tìm thấy buồng nuôi được chỉ định." },
      });
      return;
    }

    const roomInfo = roomRes.recordset[0];
    const roomPrefix = (roomInfo.RoomCode || `RM0${roomId}`).replace(/[^A-Z0-9]/gi, "").toUpperCase();

    const existingRes = await pool
      .request()
      .input("RoomID", sql.Int, roomId)
      .query(`
        SELECT TrayCode, RackNumber, ShelfLevel, PositionNumber
        FROM dbo.CultivationTrays
        WHERE RoomID = @RoomID
        ORDER BY RackNumber DESC, ShelfLevel DESC, PositionNumber DESC
      `);

    const existingCodes = new Set<string>(
      existingRes.recordset.map((r: any) => String(r.TrayCode).toUpperCase())
    );

    // Tìm số thứ tự khay lớn nhất hiện có trong buồng (theo chuẩn 3 chữ số '001'..'028')
    let maxSeq = existingRes.recordset.length;
    for (const r of existingRes.recordset) {
      const m = String(r.TrayCode || "").match(/-(\d{1,4})$/);
      if (m) {
        const num = Number(m[1]);
        if (num > maxSeq) maxSeq = num;
      }
    }

    // 2. Xác định vị trí Kệ (Rack), Tầng (Shelf) và Mã 3 chữ số đồng bộ cho từng khay mới
    const createdTrays: any[] = [];

    for (let i = 0; i < count; i++) {
      let nextSeq = maxSeq + 1 + i;
      const defaultRack = Math.floor((nextSeq - 1) / 10) + 1;
      const defaultShelf = Math.floor(((nextSeq - 1) % 10) / 2) + 1;
      const defaultPos = ((nextSeq - 1) % 2) + 1;

      const targetRack = customRack && count === 1 ? customRack : defaultRack;
      const targetShelf = customShelf && count === 1 ? customShelf : defaultShelf;
      const rackStr = String(targetRack).padStart(2, "0");

      let candidateCode = `TRAY-${roomPrefix}-R${rackStr}-${String(nextSeq).padStart(3, "0")}`;
      while (existingCodes.has(candidateCode.toUpperCase())) {
        nextSeq += 1;
        candidateCode = `TRAY-${roomPrefix}-R${rackStr}-${String(nextSeq).padStart(3, "0")}`;
      }
      existingCodes.add(candidateCode.toUpperCase());

      const insertRes = await pool
        .request()
        .input("TrayCode", sql.VarChar(50), candidateCode)
        .input("RoomID", sql.Int, roomId)
        .input("RackNumber", sql.Int, targetRack)
        .input("ShelfLevel", sql.Int, targetShelf)
        .input("PositionNumber", sql.Int, defaultPos)
        .input("Status", sql.VarChar(20), initialStatus)
        .query(`
          INSERT INTO dbo.CultivationTrays (
            TrayCode, RoomID, RackNumber, ShelfLevel, PositionNumber, Status, LastCleanedAt
          )
          OUTPUT
            INSERTED.TrayID AS trayId,
            INSERTED.TrayCode AS trayCode,
            INSERTED.RoomID AS roomId,
            INSERTED.RackNumber AS rackNumber,
            INSERTED.ShelfLevel AS shelfLevel,
            INSERTED.PositionNumber AS positionNumber,
            INSERTED.Status AS status
          VALUES (
            @TrayCode, @RoomID, @RackNumber, @ShelfLevel, @PositionNumber, @Status, SYSDATETIME()
          );
        `);

      if (insertRes.recordset.length > 0) {
        createdTrays.push(insertRes.recordset[0]);
      }
    }

    // 3. Tự động nâng công suất MaxTrays của buồng nuôi nếu tổng số khay vượt trần cũ
    const newTotalCount = existingRes.recordset.length + createdTrays.length;
    if (newTotalCount > (roomInfo.MaxTrays || 0)) {
      await pool
        .request()
        .input("RoomID", sql.Int, roomId)
        .input("NewMax", sql.Int, newTotalCount)
        .query(`UPDATE dbo.Rooms SET MaxTrays = @NewMax WHERE RoomID = @RoomID`);
    }

    // Phát sóng sự kiện qua Socket.io
    broadcastEvent("tray:created", {
      roomId,
      count: createdTrays.length,
      trays: createdTrays,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: `Đã khởi tạo thành công ${createdTrays.length} khay nuôi mới trong ${roomInfo.RoomName}!`,
      data: createdTrays,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "CREATE_TRAY_ERROR",
        message: error.message || "Lỗi khởi tạo khay nuôi mới trong CSDL",
      },
    });
  }
};

// 7. GET /api/operator/users - Lấy danh sách tài khoản người dùng (Dành cho Admin xem chức năng A3)
export const getUsersList = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    if (!pool) {
      res.json({
        success: true,
        data: [
          { userId: 1, fullName: "Nguyễn Quản Trị", email: "admin@mushroomcloud.test", phoneNumber: "0900000001", roleId: 1, roleName: "Admin", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 2, fullName: "Trần Kỹ Thuật", email: "operator1@mushroomcloud.test", phoneNumber: "0900000002", roleId: 2, roleName: "Operator", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 3, fullName: "Lê Vận Hành", email: "operator2@mushroomcloud.test", phoneNumber: "0900000003", roleId: 2, roleName: "Operator", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 4, fullName: "Phạm Minh An", email: "customer1@mushroomcloud.test", phoneNumber: "0900000011", roleId: 3, roleName: "Customer", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 5, fullName: "Võ Thu Hà", email: "customer2@mushroomcloud.test", phoneNumber: "0900000012", roleId: 3, roleName: "Customer", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
        ],
      });
      return;
    }

    const result = await pool.request().query(`
      SELECT 
        u.UserID AS userId,
        u.FullName AS fullName,
        u.Email AS email,
        u.PhoneNumber AS phoneNumber,
        u.RoleID AS roleId,
        r.RoleName AS roleName,
        u.IsActive AS isActive,
        u.CreatedAt AS createdAt,
        u.UpdatedAt AS updatedAt
      FROM dbo.Users u
      JOIN dbo.Roles r ON u.RoleID = r.RoleID
      ORDER BY u.RoleID ASC, u.UserID ASC;
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "FETCH_USERS_ERROR", message: error.message },
    });
  }
};

// 8. PUT /api/operator/users/:userId/status - Vô hiệu hóa / Kích hoạt tài khoản (IsActive)
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const pool = getPool();

    if (!pool) {
      res.json({ success: true, message: "Cập nhật trạng thái người dùng thành công (demo offline)!" });
      return;
    }

    await pool
      .request()
      .input("UserID", sql.Int, Number(userId))
      .input("IsActive", sql.Bit, isActive ? 1 : 0)
      .query(`
        UPDATE dbo.Users 
        SET IsActive = @IsActive, UpdatedAt = SYSDATETIME() 
        WHERE UserID = @UserID;
      `);

    res.json({
      success: true,
      message: `Đã ${isActive ? "kích hoạt" : "vô hiệu hóa"} tài khoản thành công!`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_STATUS_ERROR", message: error.message },
    });
  }
};

// 9. PUT /api/operator/users/:userId/role - Thay đổi vai trò người dùng (Role Assignment)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    const pool = getPool();

    if (!pool) {
      res.json({ success: true, message: "Cập nhật vai trò người dùng thành công (demo offline)!" });
      return;
    }

    await pool
      .request()
      .input("UserID", sql.Int, Number(userId))
      .input("RoleID", sql.Int, Number(roleId))
      .query(`
        UPDATE dbo.Users 
        SET RoleID = @RoleID, UpdatedAt = SYSDATETIME() 
        WHERE UserID = @UserID;
      `);

    res.json({
      success: true,
      message: "Phân công vai trò người dùng thành công!",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_ROLE_ERROR", message: error.message },
    });
  }
};

// 10. POST /api/operator/users/:userId/reset-password - Đặt lại mật khẩu về mặc định
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const defaultHash = "$2b$10$.ZGg4WBvFH/I0c3sZ/U7tOPBVTu0adhl.XO4BS2GpQxfzwCPaIR7C";

    if (!pool) {
      res.json({ success: true, message: "Đã đặt lại mật khẩu về 'Password123@' (demo offline)!" });
      return;
    }

    await pool
      .request()
      .input("UserID", sql.Int, Number(userId))
      .input("PasswordHash", sql.NVarChar(255), defaultHash)
      .query(`
        UPDATE dbo.Users 
        SET PasswordHash = @PasswordHash, UpdatedAt = SYSDATETIME() 
        WHERE UserID = @UserID;
      `);

    res.json({
      success: true,
      message: "Đã đặt lại mật khẩu về mặc định (Password123@) thành công!",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "RESET_PASSWORD_ERROR", message: error.message },
    });
  }
};
