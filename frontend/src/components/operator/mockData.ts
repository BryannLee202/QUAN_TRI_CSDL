import type { AlertItem, DeviceState, RoomOption, TrayCell } from "./types";

export const MOCK_ROOMS: RoomOption[] = [
  { roomId: 1, roomCode: "ROOM-01", roomName: "Buồng Bào Ngư Xám Nhật (CNC)", speciesName: "Nấm bào ngư xám" },
  { roomId: 2, roomCode: "ROOM-02", roomName: "Buồng Nấm Hầu Thủ Vi Khí Hậu", speciesName: "Nấm hầu thủ" },
  { roomId: 3, roomCode: "ROOM-03", roomName: "Buồng Đông Trùng & Linh Chi Dược Liệu", speciesName: "Đông trùng hạ thảo" },
];

function generateRoomTrays(roomId: number, roomCode: string, defaultSpecies: string): TrayCell[] {
  return Array.from({ length: 50 }, (_, i) => {
    const rack = (i % 10) + 1;
    const shelf = Math.floor(i / 10) + 1;
    const status = i % 17 === 0 ? "MAINTENANCE" : i % 6 === 0 ? "AVAILABLE" : "OCCUPIED";
    const rackPad = String(rack).padStart(2, "0");
    const seqPad = String(i + 1).padStart(3, "0");
    const species =
      roomId === 3
        ? i % 3 === 0
          ? "Nấm linh chi đỏ"
          : "Đông trùng hạ thảo"
        : defaultSpecies;

    return {
      trayId: (roomId - 1) * 100 + i + 1,
      trayCode: `TRAY-${roomCode}-R${rackPad}-${seqPad}`,
      roomId,
      rackNumber: rack,
      shelfLevel: shelf,
      positionNumber: 1,
      status,
      speciesName: status === "OCCUPIED" ? species : defaultSpecies,
      orderCode: status === "OCCUPIED" ? `ORD-2026-${String(i + 1).padStart(3, "0")}` : null,
      customerName: status === "OCCUPIED" ? (i % 2 === 0 ? "Phạm Minh An" : "Hoàng Gia Khang") : null,
      inoculationDate: "2026-10-15T08:00:00Z",
      expectedHarvestDate: "2026-11-28T08:00:00Z",
    };
  });
}

export const MOCK_TRAYS: TrayCell[] = [
  ...generateRoomTrays(1, "RM01", "Nấm bào ngư xám"),
  ...generateRoomTrays(2, "RM02", "Nấm hầu thủ"),
  ...generateRoomTrays(3, "RM03", "Đông trùng hạ thảo"),
];

export const MOCK_ALERTS: AlertItem[] = [
  {
    alertId: 1,
    roomId: 1,
    alertType: "HIGH_CO2",
    severity: "CRITICAL",
    message: "CO2 vượt ngưỡng: 1250 ppm",
    alertTime: new Date().toISOString(),
    isResolved: false,
  },
  {
    alertId: 2,
    roomId: 2,
    alertType: "LOW_HUMIDITY",
    severity: "WARNING",
    message: "Độ ẩm buồng Hầu Thủ giảm: 82.4% (Chuẩn: 88-95%)",
    alertTime: new Date().toISOString(),
    isResolved: false,
  },
];

export const MOCK_DEVICES: Record<string, DeviceState> = {
  "1:EXHAUST_FAN": { on: false },
  "1:MISTING_SYSTEM": { on: false },
  "2:EXHAUST_FAN": { on: false },
  "2:MISTING_SYSTEM": { on: true },
  "3:EXHAUST_FAN": { on: false },
  "3:MISTING_SYSTEM": { on: false },
};
