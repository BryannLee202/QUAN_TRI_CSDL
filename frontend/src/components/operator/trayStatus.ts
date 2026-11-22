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
  active: "bg-[#10B981] hover:bg-[#059669] text-white shadow-xs font-semibold",
  alert: "bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold animate-pulse shadow-xs",
  maintenance: "bg-[#8A5C38] hover:bg-[#704627] text-white shadow-xs",
  empty: "border border-[#D9C8B5] dark:border-[#474039] bg-[#FAF5EE] dark:bg-[#322D28] text-[#8C6D53] dark:text-[#B9ADA1] hover:border-[#C28E58]",
};