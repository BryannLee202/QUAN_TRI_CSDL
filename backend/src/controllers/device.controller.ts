import crypto from "crypto";
import { Request, Response } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";

/**
 * Device Controller - cổng giao tiếp cho thiết bị IoT thật (ESP32)
 *
 * Hợp đồng API giữa firmware ESP32 (firmware/esp32) và backend:
 *   POST /api/iot/readings  { temperature, humidity, co2 }  header x-device-key  -> 201 { commands }
 *   GET  /api/iot/commands                                  header x-device-key  -> 200 { commands }
 *   commands = [{ kind: "mist" | "fan" | "light" | "heater", state: boolean, mode: "auto" | "manual" }]
 *
 * API key chỉ lưu dạng SHA-256 trong bảng IoTDevices (xem database/06_iot_devices.sql).
 */

interface CommandRow {
  Kind: string;
  DeviceType: string;
  State: boolean;
  Mode: "auto" | "manual";
  ActionState: string;
  TriggeredBy: string | null;
  ExecutedAt: Date | null;
}

export const hashDeviceKey = (key: string): string =>
  crypto.createHash("sha256").update(key, "utf8").digest("hex").toUpperCase();

const generateDeviceKey = (): string => `mc_${crypto.randomBytes(24).toString("hex")}`;

const clientIp = (req: Request): string | null => {
  const ip = req.socket.remoteAddress || null;
  return ip ? ip.replace(/^::ffff:/, "").slice(0, 45) : null;
};

const readDeviceKey = (req: Request): string | null => {
  const key = req.header("x-device-key");
  return key && key.trim().length >= 8 && key.trim().length <= 200 ? key.trim() : null;
};

const toCommands = (rows: CommandRow[] = []) =>
  rows.map((r) => ({
    kind: r.Kind,
    deviceType: r.DeviceType,
    state: Boolean(r.State),
    mode: r.Mode,
    actionState: r.ActionState,
    triggeredBy: r.TriggeredBy,
    executedAt: r.ExecutedAt,
  }));

/** Tìm recordset theo tên cột, vì trigger trên SensorData có thể sinh thêm recordset. */
const findRecordset = <T>(recordsets: unknown, column: string): T[] => {
  const list = (Array.isArray(recordsets) ? recordsets : []) as T[][];
  return list.find((rs) => rs.length > 0 && column in (rs[0] as object)) || [];
};

/** Lỗi THROW 504xx từ stored procedure -> mã HTTP; driver tedious và msnodesqlv8 báo khác nhau nên dò cả message. */
const sendDeviceError = (res: Response, error: any, fallbackCode: string): void => {
  const message: string = error?.message || "";
  const clean = message.replace(/^.*\[SQL Server\]/, "").replace(/^Error:\s*/, "");
  if (error?.number === 50401 || message.includes("DEVICE_UNAUTHORIZED")) {
    res.status(401).json({ success: false, error: { code: "DEVICE_UNAUTHORIZED", message: clean } });
  } else if (error?.number === 50400 || message.includes("INVALID_READING")) {
    res.status(400).json({ success: false, error: { code: "INVALID_READING", message: clean } });
  } else if (error?.number === 50404 || message.includes("ROOM_NOT_FOUND")) {
    res.status(404).json({ success: false, error: { code: "ROOM_NOT_FOUND", message: clean } });
  } else {
    console.error(`[device] ${fallbackCode}:`, message);
    res.status(500).json({ success: false, error: { code: fallbackCode, message: "Lỗi xử lý dữ liệu thiết bị IoT" } });
  }
};

const toNumberOrNull = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// 1. POST /api/iot/readings - ESP32 gửi số đo, nhận lại lệnh relay
export const postDeviceReading = async (req: Request, res: Response): Promise<void> => {
  const key = readDeviceKey(req);
  if (!key) {
    res.status(401).json({ success: false, error: { code: "DEVICE_UNAUTHORIZED", message: "Thiếu header x-device-key" } });
    return;
  }

  const temperature = toNumberOrNull(req.body?.temperature);
  const humidity = toNumberOrNull(req.body?.humidity);
  const co2 = toNumberOrNull(req.body?.co2);
  if (temperature === null || humidity === null || co2 === null) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_READING", message: "Cần đủ temperature, humidity và co2 dạng số." },
    });
    return;
  }

  try {
    const request = getPool().request();
    request.input("ApiKeyHash", sql.Char(64), hashDeviceKey(key));
    request.input("Temperature", sql.Decimal(5, 2), temperature);
    request.input("Humidity", sql.Decimal(5, 2), humidity);
    request.input("CO2Level", sql.Decimal(7, 2), co2);
    request.input("FirmwareVersion", sql.VarChar(30), (req.header("x-firmware-version") || "").slice(0, 30) || null);
    request.input("IpAddress", sql.VarChar(45), clientIp(req));
    const result = await request.execute("sp_IngestDeviceReading");

    const info = findRecordset<{ DeviceID: number; RoomID: number; DataID: number }>(result.recordsets, "DataID")[0];
    res.status(201).json({
      success: true,
      ok: true,
      deviceId: info?.DeviceID,
      roomId: info?.RoomID,
      dataId: info?.DataID,
      commands: toCommands(findRecordset<CommandRow>(result.recordsets, "Kind")),
    });
  } catch (error: any) {
    sendDeviceError(res, error, "DEVICE_INGEST_ERROR");
  }
};

// 2. GET /api/iot/commands - ESP32 hỏi lệnh relay (mỗi giây)
export const getDeviceCommands = async (req: Request, res: Response): Promise<void> => {
  const key = readDeviceKey(req);
  if (!key) {
    res.status(401).json({ success: false, error: { code: "DEVICE_UNAUTHORIZED", message: "Thiếu header x-device-key" } });
    return;
  }
  try {
    const request = getPool().request();
    request.input("ApiKeyHash", sql.Char(64), hashDeviceKey(key));
    request.input("IpAddress", sql.VarChar(45), clientIp(req));
    const result = await request.execute("sp_GetDeviceCommands");
    const info = findRecordset<{ DeviceID: number; RoomID: number }>(result.recordsets, "DeviceID")[0];
    res.status(200).json({
      success: true,
      deviceId: info?.DeviceID,
      roomId: info?.RoomID,
      commands: toCommands(findRecordset<CommandRow>(result.recordsets, "Kind")),
    });
  } catch (error: any) {
    sendDeviceError(res, error, "DEVICE_COMMANDS_ERROR");
  }
};

// 3. GET /api/iot/devices?roomId= - Danh sách thiết bị kèm trạng thái online (Admin, Operator)
export const listIoTDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = toNumberOrNull(req.query.roomId);
    const request = getPool().request();
    request.input("RoomID", sql.Int, roomId);
    const result = await request.query(`
      SELECT DeviceID, RoomID, RoomCode, RoomName, DeviceName, FirmwareVersion, IpAddress,
             IsActive, IsOnline, LastSeenAt, SecondsSinceSeen, CreatedAt
      FROM dbo.vw_IoTDeviceStatus
      WHERE @RoomID IS NULL OR RoomID = @RoomID
      ORDER BY RoomID, DeviceID
    `);
    res.status(200).json({
      success: true,
      data: result.recordset.map((d: any) => ({
        deviceId: d.DeviceID,
        roomId: d.RoomID,
        roomCode: d.RoomCode,
        roomName: d.RoomName,
        deviceName: d.DeviceName,
        firmwareVersion: d.FirmwareVersion,
        ipAddress: d.IpAddress,
        isActive: Boolean(d.IsActive),
        isOnline: Boolean(d.IsOnline),
        lastSeenAt: d.LastSeenAt,
        secondsSinceSeen: d.SecondsSinceSeen,
        createdAt: d.CreatedAt,
      })),
    });
  } catch (error: any) {
    sendDeviceError(res, error, "LIST_DEVICES_ERROR");
  }
};

// 4. GET /api/iot/rooms/:roomId/device-states - Trạng thái relay hiện tại của buồng (cho web)
export const getRoomDeviceStates = async (req: Request, res: Response): Promise<void> => {
  const roomId = Number(req.params.roomId);
  if (!Number.isInteger(roomId) || roomId <= 0) {
    res.status(400).json({ success: false, error: { code: "INVALID_ROOM", message: "roomId không hợp lệ" } });
    return;
  }
  try {
    const request = getPool().request();
    request.input("RoomID", sql.Int, roomId);
    const result = await request.execute("sp_GetRoomDeviceCommands");
    res.status(200).json({ success: true, data: toCommands(result.recordset as CommandRow[]) });
  } catch (error: any) {
    sendDeviceError(res, error, "ROOM_DEVICE_STATES_ERROR");
  }
};

// 5. POST /api/iot/devices - Đăng ký ESP32 mới, trả API key MỘT LẦN DUY NHẤT (Admin)
export const registerIoTDevice = async (req: Request, res: Response): Promise<void> => {
  const roomId = toNumberOrNull(req.body?.roomId);
  const deviceName = String(req.body?.deviceName || "").trim();
  if (!roomId || !deviceName || deviceName.length > 100) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_PARAMS", message: "Cần roomId và deviceName (tối đa 100 ký tự)." },
    });
    return;
  }
  try {
    const apiKey = generateDeviceKey();
    const request = getPool().request();
    request.input("RoomID", sql.Int, roomId);
    request.input("DeviceName", sql.NVarChar(100), deviceName);
    request.input("ApiKeyHash", sql.Char(64), hashDeviceKey(apiKey));
    const result = await request.execute("sp_RegisterIoTDevice");
    const d: any = result.recordset[0];
    res.status(201).json({
      success: true,
      data: { deviceId: d?.DeviceID, roomId: d?.RoomID, deviceName: d?.DeviceName, apiKey },
      message: "Lưu API key ngay: hệ thống chỉ lưu bản băm nên không xem lại được.",
    });
  } catch (error: any) {
    sendDeviceError(res, error, "REGISTER_DEVICE_ERROR");
  }
};

// 6. POST /api/iot/devices/:deviceId/rotate-key - Cấp API key mới, key cũ hết hiệu lực (Admin)
export const rotateIoTDeviceKey = async (req: Request, res: Response): Promise<void> => {
  const deviceId = Number(req.params.deviceId);
  if (!Number.isInteger(deviceId) || deviceId <= 0) {
    res.status(400).json({ success: false, error: { code: "INVALID_DEVICE", message: "deviceId không hợp lệ" } });
    return;
  }
  try {
    const apiKey = generateDeviceKey();
    const request = getPool().request();
    request.input("DeviceID", sql.Int, deviceId);
    request.input("ApiKeyHash", sql.Char(64), hashDeviceKey(apiKey));
    const result = await request.query(
      "UPDATE IoTDevices SET ApiKeyHash = @ApiKeyHash WHERE DeviceID = @DeviceID; SELECT @@ROWCOUNT AS Affected;"
    );
    if (!result.recordset[0]?.Affected) {
      res.status(404).json({ success: false, error: { code: "DEVICE_NOT_FOUND", message: "Không tìm thấy thiết bị" } });
      return;
    }
    res.status(200).json({
      success: true,
      data: { deviceId, apiKey },
      message: "Đã cấp key mới. Nạp lại firmware với key này; key cũ không còn dùng được.",
    });
  } catch (error: any) {
    sendDeviceError(res, error, "ROTATE_DEVICE_KEY_ERROR");
  }
};
