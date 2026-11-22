"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AlertFeed from "@/components/operator/AlertFeed";
import HardwareControls from "@/components/operator/HardwareControls";
import RoomTabs from "@/components/operator/RoomTabs";
import StatusLegend from "@/components/operator/StatusLegend";
import TrayMatrix from "@/components/operator/TrayMatrix";
import IotHexInspector from "@/components/operator/IotHexInspector";
import VirtualTrayInspectorModal from "@/components/operator/VirtualTrayInspectorModal";
import ThemeToggle from "@/components/layout/ThemeToggle";
import CheatsheetDrawer from "@/components/operator/CheatsheetDrawer";
import UserManagementModal from "@/components/operator/UserManagementModal";
import { isDeviceOn } from "@/components/operator/deviceState";
import { MOCK_ALERTS, MOCK_DEVICES, MOCK_ROOMS, MOCK_TRAYS } from "@/components/operator/mockData";
import type { AlertItem, DeviceState, RoomOption, TrayCell, TrayUiStatus } from "@/components/operator/types";
import { useOperatorSocket } from "@/hooks/useOperatorSocket";
import { useAuth } from "@/contexts/AuthContext";
import {
  createOperatorTraysApi,
  getOperatorAlertsApi,
  getOperatorRoomsApi,
  getOperatorTraysApi,
  resolveOperatorAlertApi,
  toggleOperatorDeviceApi,
  updateOperatorTrayStatusApi,
} from "@/services/api";

export default function OperatorPage() {
  const { user, isAdmin, isOperator, isAuthenticated, openAuthModal } = useAuth();
  const [rooms, setRooms] = useState<RoomOption[]>(MOCK_ROOMS);
  const [roomId, setRoomId] = useState<number>(MOCK_ROOMS[0].roomId);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [devices, setDevices] = useState<Record<string, DeviceState>>(MOCK_DEVICES);
  const [trays, setTrays] = useState<TrayCell[]>(MOCK_TRAYS);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TrayUiStatus>("ALL");

  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [selectedTray, setSelectedTray] = useState<TrayCell | null>(null);
  const [isUpdatingTray, setIsUpdatingTray] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // State cho Modal Tạo Thêm Khay Nuôi Mới (Dành cho Admin / Operator)
  const [isCreateTrayOpen, setIsCreateTrayOpen] = useState(false);
  const [createCount, setCreateCount] = useState<number>(1);
  const [createStatus, setCreateStatus] = useState<"AVAILABLE" | "MAINTENANCE">("AVAILABLE");
  const [customRack, setCustomRack] = useState<string>("");
  const [customShelf, setCustomShelf] = useState<string>("");
  const [isCreatingTrays, setIsCreatingTrays] = useState(false);

  // State cho Modal Quản lý Người dùng & Phân quyền RBAC (Chức năng A3 - Dành cho Admin)
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // 1. Tải dữ liệu ban đầu từ Backend SQL Server & tự động đồng bộ khi chuyển Tab hoặc có thay đổi từ Tab khác
  const fetchOperatorSnapshot = useCallback(async (isFirstLoad: boolean = false) => {
    try {
      const [roomsRes, traysRes, alertsRes] = await Promise.allSettled([
        getOperatorRoomsApi(),
        getOperatorTraysApi(),
        getOperatorAlertsApi(),
      ]);

      if (roomsRes.status === "fulfilled") {
        const rList = Array.isArray(roomsRes.value) ? roomsRes.value : roomsRes.value?.data;
        if (Array.isArray(rList) && rList.length > 0) {
          setRooms(rList);
          if (isFirstLoad) {
            const urlParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("room") : null;
            const matchedRoom = urlParam
              ? rList.find((r) => r.roomCode?.toUpperCase() === urlParam.toUpperCase() || String(r.roomId) === urlParam)
              : null;
            setRoomId(matchedRoom ? matchedRoom.roomId : rList[0].roomId);
          }
        }
      }

      if (traysRes.status === "fulfilled") {
        const tList = Array.isArray(traysRes.value) ? traysRes.value : traysRes.value?.data;
        if (Array.isArray(tList) && tList.length > 0) {
          setTrays(tList);
        }
      }

      if (alertsRes.status === "fulfilled") {
        const aList = Array.isArray(alertsRes.value) ? alertsRes.value : alertsRes.value?.data;
        if (Array.isArray(aList) && aList.length > 0) {
          setAlerts(aList);
        }
      }
    } catch (err) {
      console.warn("Lỗi tải dữ liệu CSDL, dùng fallback mock:", err);
    }
  }, []);

  useEffect(() => {
    fetchOperatorSnapshot(true);

    // Lắng nghe kênh BroadcastChannel để đồng bộ tức thì khi Tab khác vừa đặt thuê/tạo khay/cập nhật trạng thái
    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      ch = new BroadcastChannel("smartmushroom_sync");
      ch.onmessage = () => {
        fetchOperatorSnapshot(false);
      };
    }

    const handleFocus = () => {
      fetchOperatorSnapshot(false);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      ch?.close();
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchOperatorSnapshot]);

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
          tray.trayId === t.trayId ? { ...tray, status: "OCCUPIED", orderCode: t.orderCode } : tray
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
  const activeSelectedTray = useMemo(
    () => (selectedTray ? trays.find((t) => t.trayId === selectedTray.trayId) ?? selectedTray : null),
    [trays, selectedTray]
  );
  const roomLabel = useCallback(
    (id: number) => rooms.find((r) => r.roomId === id)?.roomCode ?? `Buồng ${id}`,
    [rooms]
  );

  // 3. Xử lý điều khiển thiết bị (Lưu vào CSDL DeviceActionLogs)
  const toggleDevice = useCallback(
    async (deviceType: string, next: boolean) => {
      if (!isAdmin && !isOperator) {
        setActionNotice("Từ chối: Thao tác bật/tắt thiết bị buồng nuôi yêu cầu tài khoản Quản trị viên hoặc Kỹ thuật viên!");
        setTimeout(() => setActionNotice(null), 4000);
        openAuthModal("login");
        return;
      }

      setDevices((prev) => ({
        ...prev,
        [`${roomId}:${deviceType}`]: { on: next, actionState: next ? "ON" : "OFF", triggeredBy: user?.fullName || "OPERATOR" },
      }));

      try {
        await toggleOperatorDeviceApi({
          roomId,
          deviceType,
          actionState: next ? "ON" : "OFF",
          triggeredBy: user?.fullName || "OPERATOR",
          details: `Kỹ thuật viên can thiệp phần cứng buồng ${roomId}`,
        });
        setActionNotice(`Đã chuyển trạng thái ${deviceType} buồng ${roomId} sang ${next ? "BẬT" : "TẮT"}`);
        setTimeout(() => setActionNotice(null), 3500);
      } catch (err: any) {
        console.error("Lỗi cập nhật thiết bị về CSDL:", err);
      }
    },
    [roomId, isAdmin, isOperator, user, openAuthModal]
  );

  // 4. Đánh dấu xử lý cảnh báo (Lưu vào CSDL SensorAlerts)
  const resolveAlert = useCallback(
    async (alertId: number) => {
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

    if (!isAdmin && !isOperator) {
      alert("Từ chối: Thao tác chuyển đổi trạng thái bảo dưỡng khay yêu cầu tài khoản Quản trị viên (Admin) hoặc Kỹ thuật viên (Operator)!");
      openAuthModal("login");
      return;
    }

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

  // 6. Khởi tạo thêm khay nuôi mới (Dành cho Admin / Operator khi buồng sắp kín chỗ)
  const handleCreateNewTrays = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingTrays) return;

    if (!isAdmin && !isOperator) {
      alert("Chức năng mở rộng & tạo thêm khay nuôi mới yêu cầu tài khoản Quản trị viên (Admin) hoặc Kỹ thuật viên (Operator)!");
      openAuthModal("login");
      return;
    }

    setIsCreatingTrays(true);
    try {
      const res = await createOperatorTraysApi({
        roomId,
        count: createCount,
        rackNumber: createCount === 1 && customRack ? Number(customRack) : undefined,
        shelfLevel: createCount === 1 && customShelf ? Number(customShelf) : undefined,
        status: createStatus,
      });

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTrays((prev) => [...prev, ...res.data]);
        setStatusFilter("ALL");
        setIsCreateTrayOpen(false);
        setCustomRack("");
        setCustomShelf("");
        const codes = res.data.map((t: any) => t.trayCode).join(", ");
        setActionNotice(`Đã khởi tạo ${res.data.length} khay mới (${codes}) vào cơ sở dữ liệu!`);
        setTimeout(() => setActionNotice(null), 4500);
      }
    } catch (err: any) {
      // Nếu đang ở chế độ demo offline/mock, vẫn cho phép bổ sung trực tiếp trên giao diện
      const currentRoomTrays = trays.filter((t) => t.roomId === roomId);
      const baseSeq = currentRoomTrays.length;
      const roomCode = roomLabel(roomId).replace(/[^A-Z0-9]/gi, "").toUpperCase();
      const fallbackCreated: TrayCell[] = [];
      for (let i = 0; i < createCount; i++) {
        const nextSeq = baseSeq + 1 + i;
        const nextRack = createCount === 1 && customRack ? Number(customRack) : Math.floor((nextSeq - 1) / 10) + 1;
        const nextShelf = createCount === 1 && customShelf ? Number(customShelf) : Math.floor(((nextSeq - 1) % 10) / 2) + 1;
        const code = `TRAY-${roomCode}-R${String(nextRack).padStart(2, "0")}-${String(nextSeq).padStart(3, "0")}`;
        fallbackCreated.push({
          trayId: Date.now() + i,
          trayCode: code,
          roomId,
          rackNumber: nextRack,
          shelfLevel: nextShelf,
          positionNumber: ((nextSeq - 1) % 2) + 1,
          status: createStatus,
        });
      }
      setTrays((prev) => [...prev, ...fallbackCreated]);
      setStatusFilter("ALL");
      setIsCreateTrayOpen(false);
      setActionNotice(`Đã khởi tạo ${fallbackCreated.length} khay mới vào buồng ${roomLabel(roomId)}!`);
      setTimeout(() => setActionNotice(null), 4000);
    } finally {
      setIsCreatingTrays(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#1E1B18] p-6 lg:p-8 text-[#24170E] dark:text-[#F7EFE6] transition-colors font-sans">
      {/* Thông báo thao tác tức thì (Toast) */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-[#24170E] text-[#FFF5EA] px-4 py-3 shadow-xl border border-[#C28E58] flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Điều Hành */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D3C1] dark:border-[#474039] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#474039] text-xs font-bold hover:bg-[#F2E8DC] dark:hover:bg-[#3C3630] text-[#523522] dark:text-[#E2BA78] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Cổng Khách Hàng</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-black text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                Trung Tâm Điều Hành Trang Trại FaaS
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#FAF5EE] dark:bg-[#322D28] text-[#C28E58] border border-[#DECFC0] dark:border-[#474039]">
                Operator Hub
              </span>
            </div>
            <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
              Giám sát ma trận khay, mở rộng công suất kệ nuôi và can thiệp rơ-le IoT thời gian thực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Nút Quản Lý Người Dùng & Phân Quyền (Chỉ Admin mới thấy - Chức năng A3) */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsUserManagementOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer animate-pulse"
              title="Mở bảng quản trị người dùng & phân quyền"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Quản Lý Người Dùng (A3)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCheatsheetOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C28E58] to-[#A66C38] hover:from-[#B37F49] hover:to-[#965E2D] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="Mở sổ tay tra cứu kỹ thuật"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            <span>Sổ Tay Kỹ Thuật SOP</span>
          </button>

          <span
            className={`rounded-xl px-3 py-2 text-xs font-semibold shrink-0 whitespace-nowrap shadow-2xs flex items-center gap-2 tabular-nums ${
              connected
                ? "bg-[#FAF5EE] text-[#523522] dark:bg-[#322D28] dark:text-[#E2BA78] border border-[#C28E58]"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
            <span>{connected ? "Socket CSDL: 5000" : "Đang kết nối..."}</span>
          </span>

          <ThemeToggle />
        </div>
      </header>

      {/* Cảnh báo phân quyền RBAC nếu không phải Admin/Operator */}
      {!isAdmin && !isOperator && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 flex items-center justify-center font-bold shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div>
              <strong className="block font-bold text-[13px]">
                {isAuthenticated ? `Chế Độ Khách Hàng (Tài khoản: ${user?.fullName})` : "Chế Độ Khách Tham Quan (Chưa Đăng Nhập)"}
              </strong>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                Bạn đang ở chế độ Chỉ Xem (View-Only). Quyền khởi tạo khay mới, can thiệp rơ-le phần cứng IoT và điều phối bảo dưỡng được bảo vệ theo tiêu chuẩn RBAC.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C28E58] to-[#8A5C38] hover:from-[#B37F49] hover:to-[#704627] text-white font-bold transition shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <span>Đăng Nhập Admin / Operator</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3.333 8h9.334M8.667 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      )}

      {/* Lưới Quản Lý Chính */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Khối Trái: Ma Trận Khay Nuôi Vật Lý */}
        <section className="space-y-4 rounded-3xl border border-[#E0D3C1] dark:border-[#474039] bg-white dark:bg-[#27231F] p-5 sm:p-6 shadow-sm lg:col-span-2 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F0E6D8] dark:border-[#2D1D13]">
            <div>
              <h2 className="font-extrabold text-base text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                Sơ Đồ Kệ &amp; Ma Trận Khay Nuôi
              </h2>
              <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                Chọn buồng nuôi, lọc nhanh trạng thái hoặc khởi tạo thêm khay mới khi trang trại kín chỗ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <RoomTabs
                rooms={rooms}
                selectedRoomId={roomId}
                alertRoomIds={alertRoomIds}
                onSelect={(id) => {
                  setRoomId(id);
                  setStatusFilter("ALL");
                }}
              />

              {/* Nút Tạo Thêm Khay Mới Dành Cho Admin / Kỹ Thuật Viên */}
              <button
                type="button"
                onClick={() => {
                  if (!isAdmin && !isOperator) {
                    openAuthModal("login");
                    return;
                  }
                  setIsCreateTrayOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Khởi tạo thêm khay nuôi mới vào buồng hiện tại"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Tạo Khay Mới</span>
              </button>
            </div>
          </div>

          <StatusLegend
            trays={traysInRoom}
            roomHasAlert={roomHasAlert}
            selectedFilter={statusFilter}
            onSelectFilter={setStatusFilter}
          />

          <TrayMatrix
            trays={trays}
            roomId={roomId}
            roomHasAlert={roomHasAlert}
            statusFilter={statusFilter}
            onSelectTray={(tray) => setSelectedTray(tray)}
          />
        </section>

        {/* Khối Phải: Điều Khiển Phần Cứng & Cảnh Báo IoT */}
        <div className="space-y-6">
          <HardwareControls roomId={roomId} devices={devices} onToggle={toggleDevice} />
          <IotHexInspector
            currentRoomId={roomId}
            onIngestSuccess={(data) => {
              setActionNotice(`Bản tin cảm biến #${data.dataId} đã nạp thành công vào CSDL!`);
              setTimeout(() => setActionNotice(null), 3500);
            }}
          />
          <AlertFeed alerts={alerts} roomLabel={roomLabel} onResolve={resolveAlert} />
        </div>
      </div>

      {/* Modal Khởi Tạo & Mở Rộng Khay Nuôi Mới (Dành cho Admin / Operator) */}
      {isCreateTrayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] shadow-2xl p-6 sm:p-7 text-[#24170E] dark:text-[#FFF5EA]">
            <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#474039] pb-3.5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#24170E] dark:text-white">
                    Khởi Tạo &amp; Mở Rộng Khay Nuôi Mới
                  </h3>
                  <p className="text-xs text-[#735843] dark:text-[#BFA895]">
                    Tăng công suất khay nuôi cho buồng <strong className="text-[#24170E] dark:text-[#E2BA78]">{roomLabel(roomId)}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTrayOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#FAF5EE] dark:bg-[#322D28] hover:bg-[#F2E8DC] text-[#735843] flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTrays} className="space-y-4 text-xs">
              {/* Chọn số lượng khay cần bổ sung */}
              <div>
                <label className="block font-bold text-[#3B2516] dark:text-[#DAC7B5] mb-2">
                  Quy mô mở rộng khay nuôi:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { count: 1, label: "+1 Khay Đơn", desc: "Bổ sung lẻ" },
                    { count: 5, label: "+5 Khay Mới", desc: "Thêm 1 Kệ (5 tầng)" },
                    { count: 10, label: "+10 Khay Mới", desc: "Thêm 2 Kệ (10 tầng)" },
                  ].map((opt) => {
                    const active = createCount === opt.count;
                    return (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setCreateCount(opt.count)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          active
                            ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                            : "border-[#DECFC0] dark:border-[#474039] bg-[#FAF7F2] dark:bg-[#322D28] hover:border-[#C28E58]"
                        }`}
                      >
                        <strong className="block text-sm font-extrabold tabular-nums">{opt.label}</strong>
                        <span className="text-[11px] opacity-80 block mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nếu tạo 1 khay đơn lẻ, cho phép tùy chọn Kệ & Tầng (hoặc để trống tự động) */}
              {createCount === 1 && (
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#1E1B18] border border-[#E8DCCE] dark:border-[#474039]">
                  <div>
                    <label className="block font-semibold text-[#523522] dark:text-[#DAC7B5] mb-1">
                      Số Kệ (Rack) tùy chọn:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={customRack}
                      onChange={(e) => setCustomRack(e.target.value)}
                      placeholder="Tự động cấp kệ kế tiếp"
                      className="w-full px-3 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#474039] bg-white dark:bg-[#24160E] font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#523522] dark:text-[#DAC7B5] mb-1">
                      Số Tầng (Shelf 1 - 5):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={customShelf}
                      onChange={(e) => setCustomShelf(e.target.value)}
                      placeholder="Tự động cấp tầng trống"
                      className="w-full px-3 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#474039] bg-white dark:bg-[#24160E] font-bold tabular-nums"
                    />
                  </div>
                </div>
              )}

              {/* Chọn trạng thái ban đầu */}
              <div>
                <label className="block font-bold text-[#3B2516] dark:text-[#DAC7B5] mb-1.5">
                  Trạng thái khởi tạo ban đầu:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreateStatus("AVAILABLE")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      createStatus === "AVAILABLE"
                        ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 font-bold text-emerald-900 dark:text-emerald-300"
                        : "border-[#DECFC0] dark:border-[#474039] bg-[#FAF7F2] dark:bg-[#322D28]"
                    }`}
                  >
                    <span className="block font-bold">Sẵn sàng cấp phát (AVAILABLE)</span>
                    <span className="text-[11px] opacity-80">Khách hàng có thể đặt thuê ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateStatus("MAINTENANCE")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      createStatus === "MAINTENANCE"
                        ? "border-[#C28E58] bg-[#FAF5EE] dark:bg-[#322D28] font-bold text-[#523522] dark:text-[#E2BA78]"
                        : "border-[#DECFC0] dark:border-[#474039] bg-[#FAF7F2] dark:bg-[#322D28]"
                    }`}
                  >
                    <span className="block font-bold">Chờ khử khuẩn (MAINTENANCE)</span>
                    <span className="text-[11px] opacity-80">Khử trùng UV-C trước khi mở thuê</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateTrayOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#474039] text-xs font-bold text-[#6E4B33] dark:text-[#DAC7B5] cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTrays}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isCreatingTrays ? "Đang khởi tạo..." : `Xác Nhận Tạo +${createCount} Khay Mới`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trạm Quan Sát Nông Trại Ảo & Camera Khay Nấm Thực Tế 4K (Digital Twin Inspector) */}
      <VirtualTrayInspectorModal
        tray={activeSelectedTray}
        traysInRoom={traysInRoom}
        roomCode={activeSelectedTray ? roomLabel(activeSelectedTray.roomId) : roomLabel(roomId)}
        isUpdatingTray={isUpdatingTray}
        onClose={() => setSelectedTray(null)}
        onSelectTray={(nextTray) => setSelectedTray(nextTray)}
        onToggleStatus={handleToggleTrayStatus}
        onTriggerHardwareMist={async () => {
          const targetRoomId = activeSelectedTray?.roomId || roomId;
          setDevices((prev) => ({
            ...prev,
            [`${targetRoomId}:MIST_MAKER`]: {
              on: true,
              actionState: "ON",
              triggeredBy: user?.fullName || "OPERATOR_RAIL_CAM",
            },
          }));
          if (isAdmin || isOperator) {
            await toggleOperatorDeviceApi({
              roomId: targetRoomId,
              deviceType: "MIST_MAKER",
              actionState: "ON",
              triggeredBy: user?.fullName || "OPERATOR_RAIL_CAM",
              details: `Kích hoạt phun sương bù ẩm trực tiếp từ Camera Kệ ${activeSelectedTray?.rackNumber || 1}`,
            });
          }
        }}
        onActionNotice={(msg) => {
          setActionNotice(msg);
          setTimeout(() => setActionNotice(null), 3500);
        }}
      />

      {/* Drawer Sổ Tay SOP Kỹ Thuật */}
      <CheatsheetDrawer
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      {/* Modal Quản trị Người Dùng & Phân Quyền (Chức năng A3 - Chỉ dành cho Admin) */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
      />
    </main>
  );
}
