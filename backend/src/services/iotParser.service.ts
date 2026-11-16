/**
 * IoT Binary Protocol Parser Service
 * Giải mã các gói tin nhị phân (Binary Frames / Hex Payloads) từ cảm biến vi khí hậu Modbus RTU & LoRaWAN
 * Tích hợp kiểm tra tính toàn vẹn CRC16 và nạp dữ liệu trực tiếp vào SQL Server 2022
 */

export interface ParsedSensorData {
  deviceAddress: number;
  temperature: number; // °C
  humidity: number;    // %
  co2: number;         // ppm
  lightLux?: number;   // lux
  isCrcValid: boolean;
  rawHex: string;
  protocol: "MODBUS_RTU" | "LORAWAN_COMPACT" | "GENERIC_HEX";
  timestamp: string;
}

/**
 * Tính toán checksum CRC16 Modbus (Polynomial: 0xA001)
 */
export function calculateCRC16Modbus(buffer: Buffer, length: number): number {
  let crc = 0xffff;
  for (let i = 0; i < length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

/**
 * Giải mã chuỗi Hex nhị phân nhận từ trạm cảm biến RS485 / LoRaWAN
 */
export function parseIotHexPayload(hexString: string): ParsedSensorData {
  // Làm sạch chuỗi Hex (bỏ khoảng trắng, dấu gạch nối, 0x)
  const cleanHex = hexString.replace(/0x|\s|-|:/g, "").trim();
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Độ dài chuỗi Hex không hợp lệ (phải là số chẵn byte)");
  }

  const buffer = Buffer.from(cleanHex, "hex");
  if (buffer.length < 6) {
    throw new Error("Gói tin quá ngắn (tối thiểu 6 bytes)");
  }

  const now = new Date().toISOString();

  // 1. Nhận diện gói tin Modbus RTU tiêu chuẩn (DeviceAddr + FuncCode 0x03 + ByteCount + Data + CRC16)
  if (buffer.length >= 11 && (buffer[1] === 0x03 || buffer[1] === 0x04)) {
    const deviceAddress = buffer[0];
    const byteCount = buffer[2];

    if (byteCount >= 6 && buffer.length >= 3 + byteCount + 2) {
      // Đọc các thanh ghi: Temp (2 bytes), Hum (2 bytes), CO2 (2 bytes)
      const rawTemp = buffer.readInt16BE(3);
      const rawHum = buffer.readUInt16BE(5);
      const rawCO2 = buffer.readUInt16BE(7);

      // Kiểm tra CRC16 (2 bytes cuối, Little Endian trong Modbus)
      const dataLen = 3 + byteCount;
      const expectedCrc = calculateCRC16Modbus(buffer, dataLen);
      const actualCrc = buffer.readUInt16LE(dataLen);
      const isCrcValid = expectedCrc === actualCrc;

      return {
        deviceAddress,
        temperature: parseFloat((rawTemp / 10).toFixed(1)),
        humidity: parseFloat((rawHum / 10).toFixed(1)),
        co2: rawCO2,
        lightLux: buffer.length >= 13 ? buffer.readUInt16BE(9) : undefined,
        isCrcValid,
        rawHex: cleanHex.toUpperCase(),
        protocol: "MODBUS_RTU",
        timestamp: now,
      };
    }
  }

  // 2. Nhận diện gói tin LoRaWAN Compact (6-8 bytes: Temp*10, Hum*10, CO2, [Lux])
  const rawTemp = buffer.readInt16BE(0);
  const rawHum = buffer.readUInt16BE(2);
  const rawCO2 = buffer.readUInt16BE(4);
  const lightLux = buffer.length >= 8 ? buffer.readUInt16BE(6) : undefined;

  return {
    deviceAddress: 1,
    temperature: parseFloat((rawTemp / 10).toFixed(1)),
    humidity: parseFloat((rawHum / 10).toFixed(1)),
    co2: rawCO2,
    lightLux,
    isCrcValid: true, // LoRaWAN được kiểm tra MIC/CRC ở tầng MAC
    rawHex: cleanHex.toUpperCase(),
    protocol: "LORAWAN_COMPACT",
    timestamp: now,
  };
}

/**
 * Tạo frame Modbus RTU mẫu cho mục đích mô phỏng và kiểm thử
 */
export function generateSampleModbusFrame(temp: number, hum: number, co2: number, deviceAddr = 1): string {
  const buffer = Buffer.alloc(11);
  buffer[0] = deviceAddr;      // Địa chỉ thiết bị trạm buồng
  buffer[1] = 0x03;            // Function code: Read Holding Registers
  buffer[2] = 0x06;            // Byte count: 6 bytes data
  buffer.writeInt16BE(Math.round(temp * 10), 3);
  buffer.writeUInt16BE(Math.round(hum * 10), 5);
  buffer.writeUInt16BE(co2, 7);

  const crc = calculateCRC16Modbus(buffer, 9);
  buffer.writeUInt16LE(crc, 9);

  return buffer.toString("hex").toUpperCase();
}
