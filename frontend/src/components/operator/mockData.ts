import type { AlertItem, DeviceState, RoomOption, TrayCell } from "./types";

export const MOCK_ROOMS: RoomOption[] = [
  { roomId: 1, roomCode: "ROOM-01" },
  { roomId: 2, roomCode: "ROOM-02" },
];

export const MOCK_TRAYS: TrayCell[] = Array.from({ length: 50 }, (_, i) => {
  const rack = (i % 10) + 1;
  const shelf = Math.floor(i / 10) + 1;
  const status = i % 17 === 0 ? "MAINTENANCE" : i % 6 === 0 ? "AVAILABLE" : "OCCUPIED";
  return {
    trayId: i + 1,
    trayCode: `TRAY-RM01-R${String(rack).padStart(2, "0")}-${String(shelf).padStart(2, "0")}`,
    roomId: 1,
    rackNumber: rack,
    shelfLevel: shelf,
    status,
  };
});

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
];

export const MOCK_DEVICES: Record<string, DeviceState> = {
  "1:EXHAUST_FAN": { on: false },
  "1:MISTER": { on: false },
};