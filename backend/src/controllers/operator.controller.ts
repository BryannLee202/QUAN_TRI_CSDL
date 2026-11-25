import { Request, Response } from "express";
import sql from "mssql";
import bcrypt from "bcrypt";
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
    if (!pool) {
      res.status(200).json({
        success: true,
        data: [
          { roomId: 1, roomCode: "RM01", roomName: "Buồng Bào Ngư Xám", maxTrays: 28, tempMin: 22, tempMax: 28, humidityMin: 85, humidityMax: 95, co2Max: 1000, description: "Buồng nuôi nấm Bào Ngư Xám hữu cơ", totalTrays: 28, occupiedTrays: 12, availableTrays: 14, maintenanceTrays: 2 },
          { roomId: 2, roomCode: "RM02", roomName: "Buồng Đông Trùng Hạ Thảo", maxTrays: 28, tempMin: 18, tempMax: 22, humidityMin: 80, humidityMax: 88, co2Max: 900, description: "Buồng vi khí hậu sạch vô trùng", totalTrays: 28, occupiedTrays: 18, availableTrays: 8, maintenanceTrays: 2 },
          { roomId: 3, roomCode: "RM03", roomName: "Buồng Linh Chi Đỏ", maxTrays: 28, tempMin: 24, tempMax: 30, humidityMin: 80, humidityMax: 90, co2Max: 1200, description: "Buồng dược liệu cao cấp", totalTrays: 28, occupiedTrays: 10, availableTrays: 15, maintenanceTrays: 3 },
        ],
      });
      return;
    }

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
        r.Description as description,
        r.CameraStreamUrl as cameraStreamUrl,
        COUNT(t.TrayID) as totalTrays,
        SUM(CASE WHEN t.Status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupiedTrays,
        SUM(CASE WHEN t.Status = 'AVAILABLE' THEN 1 ELSE 0 END) as availableTrays,
        SUM(CASE WHEN t.Status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenanceTrays
      FROM Rooms r
      LEFT JOIN CultivationTrays t ON r.RoomID = t.RoomID
      WHERE r.IsActive = 1
      GROUP BY r.RoomID, r.RoomCode, r.RoomName, r.MaxTrays, r.TempMin, r.TempMax, r.HumidityMin, r.HumidityMax, r.CO2Max, r.Description, r.CameraStreamUrl
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

// 1b. POST /api/operator/rooms - Tạo buồng nuôi mới (Dành cho Quản trị viên)
export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      roomCode,
      roomName,
      maxTrays,
      tempMin,
      tempMax,
      humidityMin,
      humidityMax,
      co2Max,
      description,
      cameraStreamUrl,
      initialTraysCount,
    } = req.body;

    if (!roomCode || !String(roomCode).trim() || !roomName || !String(roomName).trim()) {
      res.status(400).json({ success: false, message: "Mã buồng và tên buồng không được để trống." });
      return;
    }

    const tMin = tempMin != null ? Number(tempMin) : 20.0;
    const tMax = tempMax != null ? Number(tempMax) : 28.0;
    const hMin = humidityMin != null ? Number(humidityMin) : 80.0;
    const hMax = humidityMax != null ? Number(humidityMax) : 95.0;
    const cMax = co2Max != null ? Number(co2Max) : 1000.0;
    const maxT = maxTrays != null && Number(maxTrays) > 0 ? Number(maxTrays) : 28;

    // Ràng buộc CK_Rooms_Temperature
    if (tMin < 0 || tMax > 50 || tMin >= tMax) {
      res.status(400).json({
        success: false,
        message: "Nhiệt độ không hợp lệ: Yêu cầu 0 <= TempMin < TempMax <= 50°C theo ràng buộc CK_Rooms_Temperature.",
      });
      return;
    }

    // Ràng buộc CK_Rooms_Humidity
    if (hMin < 0 || hMax > 100 || hMin >= hMax) {
      res.status(400).json({
        success: false,
        message: "Độ ẩm không hợp lệ: Yêu cầu 0 <= HumidityMin < HumidityMax <= 100% theo ràng buộc CK_Rooms_Humidity.",
      });
      return;
    }

    // Ràng buộc CK_Rooms_CO2
    if (cMax <= 0 || cMax > 5000) {
      res.status(400).json({
        success: false,
        message: "Nồng độ CO2 không hợp lệ: Yêu cầu 0 < CO2Max <= 5000 ppm theo ràng buộc CK_Rooms_CO2.",
      });
      return;
    }

    const cleanCode = String(roomCode).trim().toUpperCase();
    const cleanName = String(roomName).trim();
    const cleanDesc = description ? String(description).trim() : null;
    const cleanCam = cameraStreamUrl ? String(cameraStreamUrl).trim() : null;

    const pool = getPool();
    if (!pool) {
      const mockNewRoom = {
        roomId: Date.now(),
        roomCode: cleanCode,
        roomName: cleanName,
        maxTrays: maxT,
        tempMin: tMin,
        tempMax: tMax,
        humidityMin: hMin,
        humidityMax: hMax,
        co2Max: cMax,
        description: cleanDesc,
        cameraStreamUrl: cleanCam,
        totalTrays: Number(initialTraysCount) || 10,
        occupiedTrays: 0,
        availableTrays: Number(initialTraysCount) || 10,
        maintenanceTrays: 0,
      };
      res.status(201).json({
        success: true,
        message: `Đã tạo buồng nuôi [${cleanCode}] thành công (demo offline)!`,
        data: mockNewRoom,
      });
      return;
    }

    // Kiểm tra trùng mã buồng
    const checkDup = await pool
      .request()
      .input("RoomCode", sql.VarChar(20), cleanCode)
      .query(`SELECT RoomID FROM dbo.Rooms WHERE RoomCode = @RoomCode`);

    if (checkDup.recordset.length > 0) {
      res.status(409).json({ success: false, message: `Mã buồng nuôi [${cleanCode}] đã tồn tại trong CSDL.` });
      return;
    }

    const insertRes = await pool
      .request()
      .input("RoomCode", sql.VarChar(20), cleanCode)
      .input("RoomName", sql.NVarChar(100), cleanName)
      .input("MaxTrays", sql.Int, maxT)
      .input("TempMin", sql.Decimal(5, 2), tMin)
      .input("TempMax", sql.Decimal(5, 2), tMax)
      .input("HumidityMin", sql.Decimal(5, 2), hMin)
      .input("HumidityMax", sql.Decimal(5, 2), hMax)
      .input("CO2Max", sql.Decimal(7, 2), cMax)
      .input("Description", sql.NVarChar(500), cleanDesc)
      .input("CameraStreamUrl", sql.NVarChar(500), cleanCam)
      .query(`
        INSERT INTO dbo.Rooms (
          RoomCode, RoomName, MaxTrays, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max, Description, CameraStreamUrl, IsActive
        )
        OUTPUT
          INSERTED.RoomID as roomId,
          INSERTED.RoomCode as roomCode,
          INSERTED.RoomName as roomName,
          INSERTED.MaxTrays as maxTrays,
          INSERTED.TempMin as tempMin,
          INSERTED.TempMax as tempMax,
          INSERTED.HumidityMin as humidityMin,
          INSERTED.HumidityMax as humidityMax,
          INSERTED.CO2Max as co2Max,
          INSERTED.Description as description,
          INSERTED.CameraStreamUrl as cameraStreamUrl
        VALUES (
          @RoomCode, @RoomName, @MaxTrays, @TempMin, @TempMax, @HumidityMin, @HumidityMax, @CO2Max, @Description, @CameraStreamUrl, 1
        );
      `);

    const newRoom = insertRes.recordset[0];
    const initTrays = Math.min(maxT, Math.max(0, Number(initialTraysCount) || 10));

    // Khởi tạo khay nuôi sẵn sàng cho buồng mới nếu có chỉ định
    if (initTrays > 0) {
      const roomPrefix = cleanCode.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      for (let i = 1; i <= initTrays; i++) {
        const rackNum = Math.floor((i - 1) / 10) + 1;
        const shelfNum = Math.floor(((i - 1) % 10) / 2) + 1;
        const posNum = ((i - 1) % 2) + 1;
        const rackStr = String(rackNum).padStart(2, "0");
        const seqStr = String(i).padStart(3, "0");
        const trayCode = `TRAY-${roomPrefix}-R${rackStr}-${seqStr}`;

        await pool
          .request()
          .input("TrayCode", sql.VarChar(50), trayCode)
          .input("RoomID", sql.Int, newRoom.roomId)
          .input("RackNumber", sql.Int, rackNum)
          .input("ShelfLevel", sql.Int, shelfNum)
          .input("PositionNumber", sql.Int, posNum)
          .query(`
            INSERT INTO dbo.CultivationTrays (
              TrayCode, RoomID, RackNumber, ShelfLevel, PositionNumber, Status, LastCleanedAt
            )
            VALUES (
              @TrayCode, @RoomID, @RackNumber, @ShelfLevel, @PositionNumber, 'AVAILABLE', SYSDATETIME()
            );
          `);
      }
    }

    broadcastEvent("room:created", { room: newRoom, initialTraysCount: initTrays, timestamp: new Date().toISOString() });

    res.status(201).json({
      success: true,
      message: `Đã khởi tạo buồng nuôi [${newRoom.roomName}] (${newRoom.roomCode}) kèm ${initTrays} khay sẵn sàng!`,
      data: {
        ...newRoom,
        totalTrays: initTrays,
        availableTrays: initTrays,
        occupiedTrays: 0,
        maintenanceTrays: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "CREATE_ROOM_ERROR", message: error.message || "Lỗi tạo buồng nuôi CSDL" },
    });
  }
};

// 1c. PUT /api/operator/rooms/:roomId - Chỉnh sửa thông số buồng nuôi (Dành cho Quản trị viên)
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = Number(req.params.roomId);
    const {
      roomName,
      maxTrays,
      tempMin,
      tempMax,
      humidityMin,
      humidityMax,
      co2Max,
      description,
      cameraStreamUrl,
    } = req.body;

    if (isNaN(roomId) || roomId <= 0) {
      res.status(400).json({ success: false, message: "ID buồng nuôi không hợp lệ." });
      return;
    }

    const tMin = tempMin != null ? Number(tempMin) : undefined;
    const tMax = tempMax != null ? Number(tempMax) : undefined;
    const hMin = humidityMin != null ? Number(humidityMin) : undefined;
    const hMax = humidityMax != null ? Number(humidityMax) : undefined;
    const cMax = co2Max != null ? Number(co2Max) : undefined;

    if (tMin != null && tMax != null) {
      if (tMin < 0 || tMax > 50 || tMin >= tMax) {
        res.status(400).json({ success: false, message: "Nhiệt độ không hợp lệ: Yêu cầu 0 <= TempMin < TempMax <= 50°C." });
        return;
      }
    }
    if (hMin != null && hMax != null) {
      if (hMin < 0 || hMax > 100 || hMin >= hMax) {
        res.status(400).json({ success: false, message: "Độ ẩm không hợp lệ: Yêu cầu 0 <= HumidityMin < HumidityMax <= 100%." });
        return;
      }
    }
    if (cMax != null && (cMax <= 0 || cMax > 5000)) {
      res.status(400).json({ success: false, message: "Nồng độ CO2 không hợp lệ: Yêu cầu 0 < CO2Max <= 5000 ppm." });
      return;
    }

    const pool = getPool();
    if (!pool) {
      res.json({
        success: true,
        message: `Đã cập nhật thông tin buồng #${roomId} thành công (demo offline)!`,
      });
      return;
    }

    const updateRes = await pool
      .request()
      .input("RoomID", sql.Int, roomId)
      .input("RoomName", sql.NVarChar(100), roomName ? String(roomName).trim() : null)
      .input("MaxTrays", sql.Int, maxTrays ? Number(maxTrays) : null)
      .input("TempMin", sql.Decimal(5, 2), tMin != null ? tMin : null)
      .input("TempMax", sql.Decimal(5, 2), tMax != null ? tMax : null)
      .input("HumidityMin", sql.Decimal(5, 2), hMin != null ? hMin : null)
      .input("HumidityMax", sql.Decimal(5, 2), hMax != null ? hMax : null)
      .input("CO2Max", sql.Decimal(7, 2), cMax != null ? cMax : null)
      .input("Description", sql.NVarChar(500), description != null ? String(description).trim() : null)
      .input("CameraStreamUrl", sql.NVarChar(500), cameraStreamUrl != null ? String(cameraStreamUrl).trim() : null)
      .query(`
        UPDATE dbo.Rooms
        SET RoomName = COALESCE(@RoomName, RoomName),
            MaxTrays = COALESCE(@MaxTrays, MaxTrays),
            TempMin = COALESCE(@TempMin, TempMin),
            TempMax = COALESCE(@TempMax, TempMax),
            HumidityMin = COALESCE(@HumidityMin, HumidityMin),
            HumidityMax = COALESCE(@HumidityMax, HumidityMax),
            CO2Max = COALESCE(@CO2Max, CO2Max),
            Description = COALESCE(@Description, Description),
            CameraStreamUrl = COALESCE(@CameraStreamUrl, CameraStreamUrl)
        OUTPUT
          INSERTED.RoomID as roomId,
          INSERTED.RoomCode as roomCode,
          INSERTED.RoomName as roomName,
          INSERTED.MaxTrays as maxTrays,
          INSERTED.TempMin as tempMin,
          INSERTED.TempMax as tempMax,
          INSERTED.HumidityMin as humidityMin,
          INSERTED.HumidityMax as humidityMax,
          INSERTED.CO2Max as co2Max,
          INSERTED.Description as description,
          INSERTED.CameraStreamUrl as cameraStreamUrl
        WHERE RoomID = @RoomID AND IsActive = 1;
      `);

    if (updateRes.recordset.length === 0) {
      res.status(404).json({ success: false, message: `Không tìm thấy buồng nuôi #${roomId}.` });
      return;
    }

    const updated = updateRes.recordset[0];
    broadcastEvent("room:updated", { room: updated, timestamp: new Date().toISOString() });

    res.json({
      success: true,
      message: `Đã cập nhật thông số buồng nuôi [${updated.roomName}] thành công!`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_ROOM_ERROR", message: error.message || "Lỗi cập nhật buồng nuôi CSDL" },
    });
  }
};

// 1d. DELETE /api/operator/rooms/:roomId - Xóa hoặc đóng buồng nuôi (Dành cho Quản trị viên)
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = Number(req.params.roomId);

    if (isNaN(roomId) || roomId <= 0) {
      res.status(400).json({ success: false, message: "ID buồng nuôi không hợp lệ." });
      return;
    }

    const pool = getPool();
    if (!pool) {
      res.json({
        success: true,
        message: `Đã xóa buồng nuôi #${roomId} thành công (demo offline)!`,
      });
      return;
    }

    // Kiểm tra xem buồng có khay đang được khách hàng thuê nuôi không (Status = 'OCCUPIED')
    const checkOccupied = await pool
      .request()
      .input("RoomID", sql.Int, roomId)
      .query(`
        SELECT COUNT(TrayID) AS occupiedCount
        FROM dbo.CultivationTrays
        WHERE RoomID = @RoomID AND Status = 'OCCUPIED'
      `);

    const occupiedCount = checkOccupied.recordset[0]?.occupiedCount || 0;
    if (occupiedCount > 0) {
      res.status(400).json({
        success: false,
        message: `Không thể xóa buồng nuôi này vì đang có ${occupiedCount} khay nấm của khách hàng đang phát triển! Vui lòng chờ thu hoạch hết trước khi giải tỏa buồng.`,
      });
      return;
    }

    // Vô hiệu hóa buồng nuôi (Soft delete an toàn toàn vẹn dữ liệu)
    await pool
      .request()
      .input("RoomID", sql.Int, roomId)
      .query(`
        UPDATE dbo.Rooms SET IsActive = 0 WHERE RoomID = @RoomID;
        UPDATE dbo.CultivationTrays SET Status = 'MAINTENANCE' WHERE RoomID = @RoomID;
      `);

    broadcastEvent("room:deleted", { roomId, timestamp: new Date().toISOString() });

    res.json({
      success: true,
      message: `Đã đóng buồng nuôi #${roomId} và chuyển các khay trống sang trạng thái bảo dưỡng thành công!`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "DELETE_ROOM_ERROR", message: error.message || "Lỗi xóa buồng nuôi CSDL" },
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
          { userId: 1, fullName: "Nguyễn Quản Trị", email: "admin@mushroomcloud.test", phoneNumber: "0900000001", address: "Khu Công Nghệ Cao, TP. Thủ Đức", roleId: 1, roleName: "Admin", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 2, fullName: "Trần Kỹ Thuật", email: "operator1@mushroomcloud.test", phoneNumber: "0900000002", address: "Trang Trại Thông Minh Khu A", roleId: 2, roleName: "Operator", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 3, fullName: "Lê Vận Hành", email: "operator2@mushroomcloud.test", phoneNumber: "0900000003", address: "Trang Trại Thông Minh Khu B", roleId: 2, roleName: "Operator", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 4, fullName: "Phạm Minh An", email: "customer1@mushroomcloud.test", phoneNumber: "0900000011", address: "123 Đường Nấm Sạch, TP.HCM", roleId: 3, roleName: "Customer", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
          { userId: 5, fullName: "Võ Thu Hà", email: "customer2@mushroomcloud.test", phoneNumber: "0900000012", address: "456 Đại Lộ Bình Dương", roleId: 3, roleName: "Customer", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
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
        u.Address AS address,
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

// 11. POST /api/operator/users - Tạo tài khoản người dùng mới (Dành cho Quản trị viên)
export const createManagedUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phoneNumber, roleId, password, address } = req.body;

    if (!fullName || !email) {
      res.status(400).json({ success: false, message: "Họ tên và email là bắt buộc." });
      return;
    }

    const validRoleId = [1, 2, 3].includes(Number(roleId)) ? Number(roleId) : 3;
    const rawPassword = password && String(password).trim().length >= 6 ? String(password).trim() : "Password123@";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const pool = getPool();
    if (!pool) {
      const mockNewUser = {
        userId: Date.now(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber?.trim() || "",
        address: address?.trim() || "",
        roleId: validRoleId,
        roleName: validRoleId === 1 ? "Admin" : validRoleId === 2 ? "Operator" : "Customer",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      res.status(201).json({
        success: true,
        message: "Tạo tài khoản người dùng thành công (demo offline)!",
        data: mockNewUser,
      });
      return;
    }

    // Kiểm tra trùng email
    const checkEmail = await pool
      .request()
      .input("Email", sql.NVarChar(120), email.trim().toLowerCase())
      .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

    if (checkEmail.recordset.length > 0) {
      res.status(409).json({ success: false, message: "Email này đã tồn tại trong hệ thống." });
      return;
    }

    const insertRes = await pool
      .request()
      .input("RoleID", sql.Int, validRoleId)
      .input("FullName", sql.NVarChar(100), fullName.trim())
      .input("Email", sql.NVarChar(120), email.trim().toLowerCase())
      .input("PhoneNumber", sql.VarChar(20), phoneNumber?.trim() || null)
      .input("PasswordHash", sql.NVarChar(255), passwordHash)
      .input("Address", sql.NVarChar(255), address?.trim() || null)
      .query(`
        INSERT INTO dbo.Users (RoleID, FullName, Email, PhoneNumber, PasswordHash, Address, IsActive)
        OUTPUT INSERTED.UserID AS userId, INSERTED.RoleID AS roleId, INSERTED.FullName AS fullName,
               INSERTED.Email AS email, INSERTED.PhoneNumber AS phoneNumber, INSERTED.Address AS address,
               INSERTED.IsActive AS isActive, INSERTED.CreatedAt AS createdAt
        VALUES (@RoleID, @FullName, @Email, @PhoneNumber, @PasswordHash, @Address, 1);
      `);

    const insertedUser = insertRes.recordset[0];
    const roleName = validRoleId === 1 ? "Admin" : validRoleId === 2 ? "Operator" : "Customer";

    res.status(201).json({
      success: true,
      message: `Đã tạo tài khoản [${roleName}] cho ${insertedUser.fullName} thành công!`,
      data: { ...insertedUser, roleName },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "CREATE_USER_ERROR", message: error.message || "Lỗi tạo tài khoản người dùng" },
    });
  }
};

// 12. PUT /api/operator/users/:userId - Cập nhật thông tin người dùng (Họ tên, SĐT, Địa chỉ, Email)
export const updateManagedUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { fullName, phoneNumber, address, email } = req.body;

    if (!fullName || !String(fullName).trim()) {
      res.status(400).json({ success: false, message: "Họ và tên không được để trống." });
      return;
    }

    const pool = getPool();
    if (!pool) {
      res.json({
        success: true,
        message: "Cập nhật thông tin người dùng thành công (demo offline)!",
        data: { userId: Number(userId), fullName, phoneNumber, address, email },
      });
      return;
    }

    // Nếu cập nhật email, kiểm tra trùng lặp với tài khoản khác
    if (email) {
      const checkEmail = await pool
        .request()
        .input("Email", sql.NVarChar(120), email.trim().toLowerCase())
        .input("UserID", sql.Int, Number(userId))
        .query("SELECT UserID FROM dbo.Users WHERE Email = @Email AND UserID != @UserID");

      if (checkEmail.recordset.length > 0) {
        res.status(409).json({ success: false, message: "Email này đã được sử dụng bởi tài khoản khác." });
        return;
      }
    }

    await pool
      .request()
      .input("UserID", sql.Int, Number(userId))
      .input("FullName", sql.NVarChar(100), fullName.trim())
      .input("PhoneNumber", sql.VarChar(20), phoneNumber?.trim() || null)
      .input("Address", sql.NVarChar(255), address?.trim() || null)
      .input("Email", sql.NVarChar(120), email?.trim().toLowerCase() || null)
      .query(`
        UPDATE dbo.Users
        SET FullName = @FullName,
            PhoneNumber = COALESCE(@PhoneNumber, PhoneNumber),
            Address = COALESCE(@Address, Address),
            Email = COALESCE(@Email, Email),
            UpdatedAt = SYSDATETIME()
        WHERE UserID = @UserID;
      `);

    res.json({
      success: true,
      message: `Đã cập nhật thông tin tài khoản #${userId} thành công!`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_USER_ERROR", message: error.message || "Lỗi cập nhật người dùng" },
    });
  }
};
