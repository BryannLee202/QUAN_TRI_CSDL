import { Request, Response } from "express";
import sql from "mssql";
import { getPool } from "../config/db.js";
import { broadcastEvent } from "../sockets/sensor.socket.js";
import {
  generateSampleModbusFrame,
  parseIotHexPayload,
} from "../services/iotParser.service.js";

/**
 * IoT Parser Controller
 * Xử lý giải mã gói tin nhị phân và ghi nhận vi khí hậu vào CSDL SQL Server
 */

// 1. POST /api/iot/decode - Giải mã gói tin Hex
export const decodeHexPayload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hexPayload } = req.body;
    if (!hexPayload || typeof hexPayload !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_HEX", message: "Vui lòng cung cấp chuỗi hexPayload hợp lệ." },
      });
      return;
    }

    const parsed = parseIotHexPayload(hexPayload);
    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: "DECODE_ERROR", message: error.message || "Không thể giải mã gói tin nhị phân" },
    });
  }
};

// 2. POST /api/iot/ingest - Giải mã và ghi nhận vào SQL Server
export const ingestHexPayload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hexPayload, roomId } = req.body;
    const targetRoomId = Number(roomId) || 1;

    if (!hexPayload || typeof hexPayload !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_HEX", message: "Vui lòng cung cấp chuỗi hexPayload hợp lệ." },
      });
      return;
    }

    const parsed = parseIotHexPayload(hexPayload);
    const pool = getPool();

    // 1. Ghi nhận vào bảng SensorData
    const insertResult = await pool.request()
      .input("RoomID", sql.Int, targetRoomId)
      .input("Temperature", sql.Decimal(5, 2), parsed.temperature)
      .input("Humidity", sql.Decimal(5, 2), parsed.humidity)
      .input("CO2Level", sql.Int, parsed.co2)
      .input("LightLux", sql.Int, parsed.lightLux ?? 500)
      .query(`
        INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, LightLux, RecordedAt)
        VALUES (@RoomID, @Temperature, @Humidity, @CO2Level, @LightLux, SYSDATETIME());
        SELECT SCOPE_IDENTITY() as dataId;
      `);

    const dataId = insertResult.recordset[0]?.dataId;

    // 2. Phát broadcast realtime telemetry cho Cổng Khách Hàng và Operator Hub
    broadcastEvent("sensor:reading", {
      dataId,
      roomId: targetRoomId,
      temperature: parsed.temperature,
      humidity: parsed.humidity,
      co2: parsed.co2,
      lightLux: parsed.lightLux,
      recordedAt: parsed.timestamp,
    });

    res.status(201).json({
      success: true,
      message: "Gói tin nhị phân đã được giải mã và nạp thành công vào SQL Server 2022",
      data: {
        dataId,
        roomId: targetRoomId,
        ...parsed,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: "INGEST_ERROR", message: error.message || "Lỗi nạp dữ liệu gói tin vào CSDL" },
    });
  }
};

// 3. GET /api/iot/sample - Tạo mẫu Frame Hex
export const getSampleFrame = (req: Request, res: Response): void => {
  const temp = req.query.temp ? Number(req.query.temp) : 24.5;
  const hum = req.query.hum ? Number(req.query.hum) : 88.5;
  const co2 = req.query.co2 ? Number(req.query.co2) : 620;
  const deviceAddr = req.query.device ? Number(req.query.device) : 1;

  const hex = generateSampleModbusFrame(temp, hum, co2, deviceAddr);
  res.status(200).json({
    success: true,
    data: {
      rawHex: hex,
      format: "Modbus RTU (Address=1, Function=0x03, 6-byte payload + CRC16)",
      temperature: temp,
      humidity: hum,
      co2,
    },
  });
};
