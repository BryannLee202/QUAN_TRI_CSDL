"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { AlertItem, DeviceState, RoomOption, TrayCell } from "@/components/operator/types";
import { useOperatorSocket } from "@/hooks/useOperatorSocket";
import {
  getOperatorAlertsApi,
  getOperatorRoomsApi,
  getOperatorTraysApi,
  resolveOperatorAlertApi,
  toggleOperatorDeviceApi,
  updateOperatorTrayStatusApi,
} from "@/services/api";

export default function OperatorPage() {
  const [rooms, setRooms] = useState<RoomOption[]>(MOCK_ROOMS);
  const [roomId, setRoomId] = useState<number>(MOCK_ROOMS[0].roomId);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [devices, setDevices] = useState<Record<string, DeviceState>>(MOCK_DEVICES);
  const [trays, setTrays] = useState<TrayCell[]>(MOCK_TRAYS);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [selectedTray, setSelectedTray] = useState<TrayCell | null>(null);
  const [isUpdatingTray, setIsUpdatingTray] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // 1. Tải dữ liệu ban đầu từ Backend SQL Server
  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        const [roomsRes, traysRes, alertsRes] = await Promise.allSettled([
          getOperatorRoomsApi(),
          getOperatorTraysApi(),
          getOperatorAlertsApi(),
        ]);

        if (!isMounted) return;

        if (roomsRes.status === "fulfilled" && roomsRes.value.success && roomsRes.value.data.length > 0) {
          setRooms(roomsRes.value.data);
          setRoomId(roomsRes.value.data[0].roomId);
        }

        if (traysRes.status === "fulfilled" && traysRes.value.success && traysRes.value.data.length > 0) {
          setTrays(traysRes.value.data);
        }

        if (alertsRes.status === "fulfilled" && alertsRes.value.success && alertsRes.value.data.length > 0) {
          setAlerts(alertsRes.value.data);
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu CSDL ban đầu, dùng fallback mock:", err);
      }
    }

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Lắng nghe sự kiện Socket.io thời gian thực
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
    onTrayOccupied: (t) => {
      setTrays((prev) =>
        prev.map((tray) =>
          tray.trayId === t.trayId ? { ...tray, status: "OCCUPIED" } : tray
        )
      );

      const newAlert: AlertItem = {
        alertId: Date.now(),
        roomId: t.roomId || 1,
        alertType: "TRAY_BOOKING",
        severity: "WARNING",
        message: `Khay #${t.trayId} vừa được gán đơn thuê mới (${t.orderCode}) qua CSDL!`,
        alertTime: new Date().toISOString(),
        isResolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    },
    onHarvestRequested: (h) => {
      const newAlert: AlertItem = {
        alertId: Date.now(),
        roomId: 1,
        alertType: "HARVEST_REQUEST",
        severity: "CRITICAL",
        message: `Yêu cầu thu hoạch mới: Đơn hàng #${h.orderId} (Mã TH: #${h.harvestId}) - Phương thức: ${h.deliveryType}`,
        alertTime: new Date().toISOString(),
        isResolved: false,
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    },
  });

  const alertRoomIds = useMemo(
    () => new Set(alerts.filter((a) => !a.isResolved).map((a) => a.roomId)),
    [alerts]
  );
  const roomHasAlert = alertRoomIds.has(roomId);
  const traysInRoom = useMemo(() => trays.filter((t) => t.roomId === roomId), [trays, roomId]);
  const roomLabel = useCallback(
    (id: number) => rooms.find((r) => r.roomId === id)?.roomCode ?? `Buồng ${id}`,
    [rooms]
  );

  // 3. Xử lý điều khiển thiết bị (Lưu vào CSDL DeviceActionLogs)
  const toggleDevice = useCallback(
    async (deviceType: string, next: boolean) => {
      // Cập nhật lạc quan trên giao diện
      setDevices((prev) => ({
        ...prev,
        [`${roomId}:${deviceType}`]: { on: next, actionState: next ? "ON" : "OFF", triggeredBy: "OPERATOR" },
      }));

      try {
        await toggleOperatorDeviceApi({
          roomId,
          deviceType,
          actionState: next ? "ON" : "OFF",
          triggeredBy: "OPERATOR",
          notes: `Kỹ thuật viên can thiệp phần cứng buồng ${roomId}`,
        });
        setActionNotice(`Đã chuyển trạng thái ${deviceType} buồng ${roomId} sang ${next ? "BẬT" : "TẮT"}`);
        setTimeout(() => setActionNotice(null), 3500);
      } catch (err: any) {
        console.error("Lỗi cập nhật thiết bị về CSDL:", err);
      }
    },
    [roomId]
  );

  // 4. Đánh dấu xử lý cảnh báo (Lưu vào CSDL SensorAlerts)
  const resolveAlert = useCallback(
    async (alertId: number) => {
      // Cập nhật lạc quan
      setAlerts((prev) => prev.map((a) => (a.alertId === alertId ? { ...a, isResolved: true } : a)));

      try {
        await resolveOperatorAlertApi(alertId, "Đã xử lý bởi kỹ thuật viên trực ca");
        setActionNotice(`Cảnh báo #${alertId} đã được đánh dấu giải quyết thành công.`);
        setTimeout(() => setActionNotice(null), 3500);
      } catch (err: any) {
        console.error("Lỗi cập nhật cảnh báo CSDL:", err);
      }
    },
    []
  );

  // 5. Cập nhật trạng thái khay (Bảo dưỡng / Sẵn sàng)
  const handleToggleTrayStatus = async () => {
    if (!selectedTray || isUpdatingTray) return;
    const nextStatus = selectedTray.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";

    setIsUpdatingTray(true);
    try {
      const res = await updateOperatorTrayStatusApi(selectedTray.trayId, nextStatus);
      if (res.success) {
        const updated = { ...selectedTray, status: nextStatus };
        setSelectedTray(updated);
        setTrays((prev) => prev.map((t) => (t.trayId === updated.trayId ? updated : t)));
        setActionNotice(`Khay ${updated.trayCode} đã chuyển trạng thái sang ${nextStatus}`);
        setTimeout(() => setActionNotice(null), 3500);
      }
    } catch (err: any) {
      alert("Không thể cập nhật trạng thái khay: " + (err.message || "Lỗi hệ thống"));
    } finally {
      setIsUpdatingTray(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B07] p-6 lg:p-8 text-[#24170E] dark:text-[#F7EFE6] transition-colors">
      {/* Thông báo thao tác tức thì (Toast) */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-[#24170E] text-[#FFF5EA] px-4 py-2.5 shadow-xl border border-[#C28E58] flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Điều Hành */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D3C1] dark:border-[#38261A] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#543825] text-xs font-bold hover:bg-[#F2E8DC] dark:hover:bg-[#281A12] text-[#523522] dark:text-[#E2BA78] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>Cổng Khách Hàng</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-black text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                Trung Tâm Điều Hành Trang Trại FaaS
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#FAF5EE] dark:bg-[#25170F] text-[#C28E58] border border-[#DECFC0] dark:border-[#4A3222]">
                Operator Hub
              </span>
            </div>
            <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
              Giám sát ma trận khay, tiếp nhận cảnh báo vi khí hậu và can thiệp rơ-le IoT thời gian thực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCheatsheetOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C28E58] to-[#A66C38] hover:from-[#B37F49] hover:to-[#965E2D] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
            title="Mở sổ tay tra cứu kỹ thuật"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span>Sổ Tay Kỹ Thuật SOP</span>
          </button>

          <span
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold shrink-0 whitespace-nowrap shadow-2xs flex items-center gap-2 ${
              connected
                ? "bg-[#FAF5EE] text-[#523522] dark:bg-[#2B1C13] dark:text-[#E2BA78] border border-[#C28E58]"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
            <span>{connected ? "Socket CSDL: 5000" : "Đang kết nối..."}</span>
          </span>

          <ThemeToggle />
        </div>
      </header>

      {/* Lưới Quản Lý Chính */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Khối Trái: Ma Trận Khay Nuôi Vật Lý */}
        <section className="space-y-4 rounded-2xl border border-[#E0D3C1] dark:border-[#38261A] bg-white dark:bg-[#20140D] p-5 shadow-sm lg:col-span-2 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0E6D8] dark:border-[#2D1D13]">
            <div>
              <h2 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">
                Sơ Đồ Kệ & Ma Trận Khay Nuôi
              </h2>
              <p className="text-[11px] text-[#735843] dark:text-[#BFA895]">
                Chọn buồng nuôi để xem vị trí Rack - Shelf và tình trạng cấp phát
              </p>
            </div>
            <RoomTabs rooms={rooms} selectedRoomId={roomId} alertRoomIds={alertRoomIds} onSelect={setRoomId} />
          </div>

          <StatusLegend trays={traysInRoom} roomHasAlert={roomHasAlert} />
          <TrayMatrix
            trays={trays}
            roomId={roomId}
            roomHasAlert={roomHasAlert}
            onSelectTray={(tray) => setSelectedTray(tray)}
          />
        </section>

        {/* Khối Phải: Điều Khiển Phần Cứng & Cảnh Báo IoT */}
        <div className="space-y-6">
          <HardwareControls roomId={roomId} devices={devices} onToggle={toggleDevice} />
          <AlertFeed alerts={alerts} roomLabel={roomLabel} onResolve={resolveAlert} />
        </div>
      </div>

      {/* Modal Chi Tiết Khay & Điều Phối Bảo Dưỡng */}
      {selectedTray && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E130B] border border-[#DECFC0] dark:border-[#4A3222] shadow-2xl p-6 text-[#24170E] dark:text-[#FFF5EA] transition-all">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#332015] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C28E58]"></span>
                <h3 className="font-bold text-base">Chi Tiết Khay Nuôi #{selectedTray.trayCode}</h3>
              </div>
              <button
                onClick={() => setSelectedTray(null)}
                className="w-7 h-7 rounded-lg bg-[#FAF5EE] dark:bg-[#2B1B12] hover:bg-[#F2E8DC] text-[#735843] flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#170E08] border border-[#E8DCCE] dark:border-[#332015]">
                <div>
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Vị trí vật lý:</span>
                  <p className="font-bold text-[#24170E] dark:text-[#FFF5EA]">
                    Kệ (Rack) {selectedTray.rackNumber} · Tầng (Shelf) {selectedTray.shelfLevel}
                  </p>
                </div>
                <div>
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Buồng nuôi:</span>
                  <p className="font-bold text-[#24170E] dark:text-[#FFF5EA]">Buồng {selectedTray.roomId}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#170E08] border border-[#E8DCCE] dark:border-[#332015] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Trạng thái hiện tại:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedTray.status === "OCCUPIED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : selectedTray.status === "MAINTENANCE"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                    }`}
                  >
                    {selectedTray.status}
                  </span>
                </div>

                {selectedTray.orderCode ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#A8907E]">Đơn thuê FaaS:</span>
                      <strong className="font-mono text-[#C28E58]">{selectedTray.orderCode}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#A8907E]">Khách hàng:</span>
                      <span className="font-semibold">{selectedTray.customerName || "Khách hàng cá nhân"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#A8907E]">Loài nấm nuôi:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {selectedTray.speciesName || "Chưa xác định"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[#8C6D53] dark:text-[#A8907E] italic pt-1">
                    Khay đang mở, sẵn sàng nhận đặt thuê từ Cổng Khách Hàng.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#F0E6D8] dark:border-[#332015] flex gap-2 justify-end">
              {selectedTray.status !== "OCCUPIED" ? (
                <button
                  type="button"
                  disabled={isUpdatingTray}
                  onClick={handleToggleTrayStatus}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                    selectedTray.status === "MAINTENANCE"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-[#8A5C38] hover:bg-[#704627] text-white"
                  }`}
                >
                  {isUpdatingTray ? (
                    "Đang lưu CSDL..."
                  ) : selectedTray.status === "MAINTENANCE" ? (
                    "Mở Lại Sẵn Sàng (AVAILABLE)"
                  ) : (
                    "Chuyển Bảo Dưỡng (MAINTENANCE)"
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-[#8C6D53] dark:text-[#A8907E] italic flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Đang nuôi nấm (Khóa bởi Hợp đồng giao dịch)
                </span>
              )}
              <button
                type="button"
                onClick={() => setSelectedTray(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1B12] hover:bg-[#EAE0D3] text-[#523522] dark:text-[#E2BA78] text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Sổ Tay SOP Kỹ Thuật */}
      <CheatsheetDrawer
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />
    </main>
  );
}
