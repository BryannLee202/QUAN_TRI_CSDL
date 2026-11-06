"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import AlertFeed from "@/components/operator/AlertFeed";
import HardwareControls from "@/components/operator/HardwareControls";
import RoomTabs from "@/components/operator/RoomTabs";
import StatusLegend from "@/components/operator/StatusLegend";
import TrayMatrix from "@/components/operator/TrayMatrix";
import ThemeToggle from "@/components/layout/ThemeToggle";
import CheatsheetDrawer from "@/components/operator/CheatsheetDrawer";
import { isDeviceOn } from "@/components/operator/deviceState";
import { MOCK_ALERTS, MOCK_DEVICES, MOCK_ROOMS, MOCK_TRAYS } from "@/components/operator/mockData";
import type { AlertItem, DeviceState } from "@/components/operator/types";
import { useOperatorSocket } from "@/hooks/useOperatorSocket";

export default function OperatorPage() {
  const [roomId, setRoomId] = useState(MOCK_ROOMS[0].roomId);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [devices, setDevices] = useState<Record<string, DeviceState>>(MOCK_DEVICES);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);

  const { connected } = useOperatorSocket({
    onAlert: (a) =>
      setAlerts((prev) => (prev.some((x) => x.alertId === a.alertId) ? prev : [a, ...prev].slice(0, 50))),
    onDevice: (d) =>
      setDevices((prev) => ({
        ...prev,
        [`${d.roomId}:${d.deviceType}`]: {
          on: isDeviceOn(d.actionState),
          actionState: d.actionState,
          triggeredBy: d.triggeredBy,
        },
      })),
  });

  const alertRoomIds = useMemo(
    () => new Set(alerts.filter((a) => !a.isResolved).map((a) => a.roomId)),
    [alerts]
  );
  const roomHasAlert = alertRoomIds.has(roomId);
  const traysInRoom = useMemo(() => MOCK_TRAYS.filter((t) => t.roomId === roomId), [roomId]);
  const roomLabel = useCallback(
    (id: number) => MOCK_ROOMS.find((r) => r.roomId === id)?.roomCode ?? `Buồng ${id}`,
    []
  );

  const toggleDevice = useCallback(
    (deviceType: string, next: boolean) =>
      setDevices((prev) => ({
        ...prev,
        [`${roomId}:${deviceType}`]: { on: next, actionState: next ? "ON" : "OFF", triggeredBy: "OPERATOR" },
      })),
    [roomId]
  );

  const resolveAlert = useCallback(
    (alertId: number) =>
      setAlerts((prev) => prev.map((a) => (a.alertId === alertId ? { ...a, isResolved: true } : a))),
    []
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 transition-colors">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition shrink-0 whitespace-nowrap"
          >
            ← Cổng Khách Hàng
          </Link>
          <h1 className="text-2xl font-bold text-[#0D5C3A] dark:text-emerald-400 shrink-0 whitespace-nowrap">
            Trung tâm điều hành kỹ thuật viên
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCheatsheetOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            title="Mở sổ tay tra cứu kỹ thuật"
          >
            <span>📋</span>
            <span>Sổ Tay Kỹ Thuật</span>
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 whitespace-nowrap shadow-sm ${
              connected
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            }`}
          >
            {connected ? "● Socket.io: Đã kết nối" : "○ Socket.io: Mất kết nối"}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:col-span-2 transition-colors">
          <RoomTabs rooms={MOCK_ROOMS} selectedRoomId={roomId} alertRoomIds={alertRoomIds} onSelect={setRoomId} />
          <StatusLegend trays={traysInRoom} roomHasAlert={roomHasAlert} />
          <TrayMatrix trays={MOCK_TRAYS} roomId={roomId} roomHasAlert={roomHasAlert} />
        </section>

        <div className="space-y-6">
          <HardwareControls roomId={roomId} devices={devices} onToggle={toggleDevice} />
          <AlertFeed alerts={alerts} roomLabel={roomLabel} onResolve={resolveAlert} />
        </div>
      </div>

      <CheatsheetDrawer
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />
    </main>
  );
}
