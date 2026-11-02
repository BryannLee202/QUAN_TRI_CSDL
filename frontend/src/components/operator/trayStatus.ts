import type { TrayUiStatus } from "./types";
const ACTIVE_STATUSES = ["OCCUPIED"];
const MAINTENANCE_STATUSES = ["MAINTENANCE"];

export function toUiStatus(dbStatus: string, roomHasAlert: boolean): TrayUiStatus {
  const s = dbStatus.toUpperCase();
  if (MAINTENANCE_STATUSES.includes(s)) return "maintenance";
  if (ACTIVE_STATUSES.includes(s)) return roomHasAlert ? "alert" : "active";
  return "empty";
}

export const STATUS_LABEL: Record<TrayUiStatus, string> = {
  active: "Đang nuôi",
  alert: "Cảnh báo",
  maintenance: "Bảo trì",
  empty: "Trống",
};

export const STATUS_STYLE: Record<TrayUiStatus, string> = {
  active: "bg-emerald-600 text-white",
  alert: "bg-orange-500 text-white animate-pulse",
  maintenance: "bg-slate-400 text-white",
  empty: "border border-slate-300 bg-white text-slate-400",
};