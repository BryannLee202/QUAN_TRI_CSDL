export type TrayUiStatus = "active" | "alert" | "maintenance" | "empty";

export interface TrayCell {
  trayId: number;
  trayCode: string;
  roomId: number;
  rackNumber: number;
  shelfLevel: number;
  status: string; // giá trị gốc của CultivationTrays.Status
}

export interface RoomOption {
  roomId: number;
  roomCode: string;
}

export interface AlertItem {
  alertId: number;
  roomId: number;
  alertType: string;
  severity: string; // WARNING | CRITICAL
  message: string;
  alertTime: string; // ISO 8601
  isResolved: boolean;
}

export interface DeviceAction {
  actionId: number;
  roomId: number;
  deviceType: string;
  actionState: string; // ON | OFF
  triggeredBy: string;
  details: string | null;
  executedAt: string;
}

export interface DeviceState {
  on: boolean;
  actionState?: string;
  triggeredBy?: string;
}

export interface SensorReading {
  dataId: number;
  roomId: number;
  trayId: number | null;
  temperature: number;
  humidity: number;
  co2: number;
  lightLux: number | null;
  recordedAt: string;
}