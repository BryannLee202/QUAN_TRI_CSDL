"use client";

import { useEffect, useState } from "react";
import { getIoTDevicesApi, type IoTDeviceItem } from "@/services/api";

/**
 * Huy hiệu trạng thái ESP32 của buồng: trực tuyến / mất kết nối / chưa gắn thiết bị.
 * Hỏi lại mỗi 10 giây. Backend coi thiết bị là online nếu liên lạc trong 60 giây gần nhất.
 */
const formatAgo = (seconds: number | null): string => {
  if (seconds === null || seconds < 0) return "chưa từng kết nối";
  if (seconds < 60) return `${seconds} giây trước`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
};

export default function IoTDeviceStatusBadge({ roomId }: { roomId: number }) {
  const [device, setDevice] = useState<IoTDeviceItem | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "none" | "forbidden">("loading");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await getIoTDevicesApi(roomId);
        if (cancelled) return;
        const active = list.find((d) => d.isActive) || null;
        setDevice(active);
        setState(active ? "ready" : "none");
      } catch {
        if (!cancelled) setState("forbidden"); // khách chưa đăng nhập hoặc không có quyền xem
      }
    };
    setState("loading");
    load();
    const timer = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [roomId]);

  if (state === "loading" || state === "forbidden") return null;

  if (state === "none" || !device) {
    return (
      <span
        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE0D3] dark:bg-[#322D28] text-[#735843] dark:text-[#B9ADA1]"
        title="Buồng này chưa gắn ESP32, dữ liệu đến từ bộ giả lập"
      >
        Giả lập
      </span>
    );
  }

  const online = device.isOnline;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
        online
          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
          : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
      }`}
      title={`${device.deviceName}${device.ipAddress ? ` · IP ${device.ipAddress}` : ""}${
        device.firmwareVersion ? ` · firmware ${device.firmwareVersion}` : ""
      } · liên lạc ${formatAgo(device.secondsSinceSeen)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
      {online ? "ESP32 trực tuyến" : `ESP32 mất kết nối · ${formatAgo(device.secondsSinceSeen)}`}
    </span>
  );
}
