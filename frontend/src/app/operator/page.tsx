"use client";

import { useCallback, useMemo, useState } from "react";
import AlertFeed from "@/components/operator/AlertFeed";
import HardwareControls from "@/components/operator/HardwareControls";
import RoomTabs from "@/components/operator/RoomTabs";
import StatusLegend from "@/components/operator/StatusLegend";
import TrayMatrix from "@/components/operator/TrayMatrix";
import { isDeviceOn } from "@/components/operator/deviceState";
import { MOCK_ALERTS, MOCK_DEVICES, MOCK_ROOMS, MOCK_TRAYS } from "@/components/operator/mockData";
import type { AlertItem, DeviceState } from "@/components/operator/types";
import { useOperatorSocket } from "@/hooks/useOperatorSocket";

export default function OperatorPage() {
  const [roomId, setRoomId] = useState(MOCK_ROOMS[0].roomId);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [devices, setDevices] = useState<Record<string, DeviceState>>(MOCK_DEVICES);

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
    <main className="min-h-screen bg-[#F8FAFC] p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0D5C3A]">Trung tâm điều hành kỹ thuật viên</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {connected ? "Realtime: đã kết nối" : "Realtime: chưa kết nối"}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <RoomTabs rooms={MOCK_ROOMS} selectedRoomId={roomId} alertRoomIds={alertRoomIds} onSelect={setRoomId} />
          <StatusLegend trays={traysInRoom} roomHasAlert={roomHasAlert} />
          <TrayMatrix trays={MOCK_TRAYS} roomId={roomId} roomHasAlert={roomHasAlert} />
        </section>

        <div className="space-y-6">
          <HardwareControls roomId={roomId} devices={devices} onToggle={toggleDevice} />
          <AlertFeed alerts={alerts} roomLabel={roomLabel} onResolve={resolveAlert} />
        </div>
      </div>
    </main>
  );
}