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
