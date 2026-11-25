export type TrayUiStatus = "active" | "alert" | "maintenance" | "empty";

export interface TrayCell {
  trayId: number;
  trayCode: string;
  roomId: number;
  rackNumber: number;
  shelfLevel: number;
  status: string; // AVAILABLE | OCCUPIED | MAINTENANCE
  orderCode?: string | null;
  customerName?: string | null;
  speciesName?: string | null;
  inoculationDate?: string | null;
  expectedHarvestDate?: string | null;
  currentOrderId?: number | null;
  positionNumber?: number;
}

export interface RoomOption {
  roomId: number;
  roomCode: string;
  roomName?: string;
  speciesName?: string;
  maxTrays?: number;
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  co2Max?: number;
  description?: string;
  cameraStreamUrl?: string;
  totalTrays?: number;
  occupiedTrays?: number;
  availableTrays?: number;
  maintenanceTrays?: number;
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