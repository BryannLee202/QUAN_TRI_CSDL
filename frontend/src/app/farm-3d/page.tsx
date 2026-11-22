'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOperatorRoomsApi,
  getOperatorTraysApi,
  getMyTraysApi,
} from "@/services/api";
import CheckoutGatewayModal, {
  CheckoutItemConfig,
} from "@/components/checkout/CheckoutGatewayModal";

interface FarmRoom {
  roomId: number;
  roomCode: string;
  roomName: string;
  totalTrays?: number;
  occupiedTrays?: number;
  availableTrays?: number;
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  co2Max?: number;
}

interface FarmTray {
  trayId: number;
  trayCode: string;
  roomId: number;
  rackNumber: number;
  shelfLevel: number;
  positionNumber: number;
  status: string;
  speciesName?: string | null;
}

const ROOM_PIN_POSITIONS = [
  { left: "26%", top: "28%" },
  { left: "48%", top: "34%" },
  { left: "73%", top: "41%" },
];

const RENTAL_PACKAGES = [
  { id: 1, name: "Gói Nấm Bào Ngư Xám Nhật", price: 299000, duration: "30 Ngày", yieldText: "~3.5 kg nấm tươi" },
  { id: 2, name: "Gói Nấm Linh Chi Đỏ Luxury", price: 899000, duration: "90 Ngày", yieldText: "~1.8 kg linh chi" },
  { id: 3, name: "Gói Đông Trùng Hạ Thảo", price: 1899000, duration: "60 Ngày", yieldText: "~0.8 kg sinh khối" },
];

export default function Farm3DPage() {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<FarmRoom[]>([]);
  const [trays, setTrays] = useState<FarmTray[]>([]);
  const [ownedTrayCodes, setOwnedTrayCodes] = useState<Set<string>>(new Set());

  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [selectedTray, setSelectedTray] = useState<FarmTray | null>(null);
  const [selectedPkgId, setSelectedPkgId] = useState<number>(1);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItemConfig | null>(null);

  const loadFarmData = useCallback(async () => {
    try {
      const [roomsRes, traysRes] = await Promise.allSettled([
        getOperatorRoomsApi(),
        getOperatorTraysApi(),
      ]);

      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value)) {
        setRooms(roomsRes.value);
        if (roomsRes.value.length > 0) {
          setSelectedRoomId((prev) =>
            roomsRes.value.some((r: FarmRoom) => r.roomId === prev)
              ? prev
              : roomsRes.value[0].roomId
          );
        }
      }

      if (traysRes.status === "fulfilled" && Array.isArray(traysRes.value)) {
        const list: FarmTray[] = traysRes.value;
        setTrays(list);
        if (typeof window !== "undefined") {
          const code = new URLSearchParams(window.location.search).get("tray");
          if (code) {
            const found = list.find((t) => t.trayCode === code);
            if (found) {
              setSelectedTray(found);
              setSelectedRoomId(found.roomId);
            }
          }
        }
      }

      if (isAuthenticated) {
        try {
          const myList = await getMyTraysApi();
          setOwnedTrayCodes(
            new Set(myList.map((m) => m.trayCode).filter(Boolean) as string[])
          );
        } catch {
          // Bỏ qua nếu phiên tạm thời chưa hợp lệ
        }
      } else {
        setOwnedTrayCodes(new Set());
      }
    } catch {
      // Giữ trạng thái hiện tại
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFarmData();
  }, [loadFarmData]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.roomId === selectedRoomId) || rooms[0] || null,
    [rooms, selectedRoomId]
  );

  const roomTrays = useMemo(
    () => trays.filter((t) => (selectedRoom ? t.roomId === selectedRoom.roomId : true)),
    [trays, selectedRoom]
  );

  const selectedPkg = useMemo(
    () => RENTAL_PACKAGES.find((p) => p.id === selectedPkgId) || RENTAL_PACKAGES[0],
    [selectedPkgId]
  );

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";

  const isOwnedSelected = Boolean(
    selectedTray && ownedTrayCodes.has(selectedTray.trayCode)
  );

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] flex flex-col justify-between font-sans transition-colors">
      <div>
        <Navbar />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">
          {/* Thanh tiêu đề gọn gàng */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#24170E] dark:text-white">
                Mô Hình Trang Trại Nấm 3D
              </h1>
              <p className="text-xs sm:text-sm text-[#735843] dark:text-[#BFA895] mt-1">
                Quan sát mô hình cắt lớp 3 buồng nuôi vô trùng và chọn khay trực tiếp trên hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-[#24170E] text-white border-[#C28E58] dark:bg-[#C28E58] dark:text-[#1E1B18]"
                    : "bg-white dark:bg-[#27231F] text-[#5E4A3A] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                }`}
              >
                Mô Hình 3D
              </button>
              <button
                type="button"
                onClick={() => setViewMode("2d")}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  viewMode === "2d"
                    ? "bg-[#24170E] text-white border-[#C28E58] dark:bg-[#C28E58] dark:text-[#1E1B18]"
                    : "bg-white dark:bg-[#27231F] text-[#5E4A3A] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                }`}
              >
                Sơ Đồ Khay ({trays.length})
              </button>
            </div>
          </div>

          {/* Khung chính: Mô hình đơn sắc nét (8 cột) + Thông tin buồng/khay (4 cột) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8">
              {viewMode === "3d" ? (
                <div className="relative w-full h-[480px] sm:h-[580px] rounded-3xl overflow-hidden border border-[#DECFC0] dark:border-[#474039] shadow-xl bg-[#F3EDE3] dark:bg-[#1E1B18]">
                  <img
                    src="/images/farm3d/overview-cutaway.jpg"
                    alt="Mô hình trang trại nấm MushroomCloud 3D"
                    className="w-full h-full object-cover"
                  />

                  {/* 3 Nhãn buồng nuôi sắc nét trên mô hình */}
                  {rooms.slice(0, 3).map((room, idx) => {
                    const pos = ROOM_PIN_POSITIONS[idx] || ROOM_PIN_POSITIONS[0];
                    const isSelected = selectedRoomId === room.roomId;
                    return (
                      <button
                        key={room.roomId}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(room.roomId);
                          setSelectedTray(null);
                        }}
                        style={{ left: pos.left, top: pos.top }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 rounded-2xl border backdrop-blur-md shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#24170E]/95 text-white border-[#E2BA78] scale-105"
                            : "bg-white/92 text-[#24170E] border-[#DECFC0] hover:border-[#C28E58]"
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <div className="text-left leading-tight">
                          <span className="text-xs font-black block">{room.roomCode}</span>
                          <span className="text-[10px] opacity-75 whitespace-nowrap">
                            {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full min-h-[480px] sm:min-h-[580px] rounded-3xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] p-5 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2E8DC] dark:border-[#474039] pb-3">
                    <div className="flex items-center gap-2">
                      {rooms.map((r) => (
                        <button
                          key={r.roomId}
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(r.roomId);
                            setSelectedTray(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            selectedRoomId === r.roomId
                              ? "bg-[#24170E] text-[#E2BA78] border-[#C28E58]"
                              : "bg-[#FAF5EE] dark:bg-[#322D28] text-[#5E4A3A] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                          }`}
                        >
                          {r.roomCode}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#E2BA78] border border-[#92400E]" />
                        Của bạn
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                        Đang nuôi
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#EFE8DC] border border-[#DECFC0]" />
                        Trống
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {roomTrays.map((t) => {
                      const owned = ownedTrayCodes.has(t.trayCode);
                      const active = selectedTray?.trayId === t.trayId;
                      const cls = active
                        ? "bg-[#24170E] text-[#E2BA78] border-[#E2BA78] ring-2 ring-[#C28E58]/40"
                        : owned
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-[#C28E58]"
                        : t.status === "OCCUPIED"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : t.status === "MAINTENANCE"
                        ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        : "bg-[#FAF5EE] dark:bg-[#322D28] text-[#735843] dark:text-[#BFA895] border-[#EAE1D3] dark:border-[#474039]";
                      return (
                        <button
                          key={t.trayId}
                          type="button"
                          onClick={() => setSelectedTray(t)}
                          className={`p-2.5 rounded-xl border text-left transition hover:scale-[1.02] cursor-pointer ${cls}`}
                        >
                          <span className="font-mono text-[11px] font-black block truncate">
                            {t.trayCode.replace("TRAY-", "")}
                          </span>
                          <span className="text-[10px] opacity-80 block truncate mt-0.5">
                            Kệ {t.rackNumber} • Tầng {t.shelfLevel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Thông tin buồng đang chọn / Khay đang chọn */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl bg-white dark:bg-[#27231F] border border-[#EAE1D3] dark:border-[#474039] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2E8DC] dark:border-[#474039] pb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-[#C28E58]">
                      {selectedRoom?.roomCode || "RM01"}
                    </span>
                    <h2 className="text-lg font-black text-[#24170E] dark:text-white">
                      {selectedRoom?.roomName || "Buồng Nuôi Công Nghệ Cao"}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                    ISO Class 5
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28]">
                    <span className="text-[10px] text-[#8A5C38] dark:text-[#BFA895] block">
                      Nhiệt độ
                    </span>
                    <strong className="text-xs font-black">
                      {selectedRoom?.tempMin ?? 22}–{selectedRoom?.tempMax ?? 25}°C
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28]">
                    <span className="text-[10px] text-[#8A5C38] dark:text-[#BFA895] block">
                      Độ ẩm
                    </span>
                    <strong className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                      {selectedRoom?.humidityMin ?? 85}–{selectedRoom?.humidityMax ?? 95}%
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28]">
                    <span className="text-[10px] text-[#8A5C38] dark:text-[#BFA895] block">
                      Khay trống
                    </span>
                    <strong className="text-xs font-black text-[#C28E58]">
                      {selectedRoom?.availableTrays ?? 0} khay
                    </strong>
                  </div>
                </div>

                {/* Chi tiết khay nếu đã chọn */}
                {selectedTray ? (
                  <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#6B442C] dark:text-[#E2BA78]">
                        {selectedTray.trayCode}
                      </span>
                      <span className="text-[11px] font-bold">
                        Kệ {selectedTray.rackNumber} • Tầng {selectedTray.shelfLevel}
                      </span>
                    </div>
                    <p className="text-sm font-bold">
                      {selectedTray.speciesName || "Khay trống sẵn sàng cho thuê"}
                    </p>

                    {isOwnedSelected && (
                      <Link
                        href={`/khay-cua-toi?tray=${encodeURIComponent(selectedTray.trayCode)}`}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold text-center block transition"
                      >
                        Mở Trang Theo Dõi Khay →
                      </Link>
                    )}

                    {selectedTray.status === "AVAILABLE" && (
                      <div className="space-y-2 pt-2 border-t border-[#DECFC0] dark:border-[#474039]">
                        <div className="space-y-1">
                          {RENTAL_PACKAGES.map((pkg) => (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedPkgId(pkg.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs transition cursor-pointer ${
                                selectedPkgId === pkg.id
                                  ? "bg-white dark:bg-[#27231F] border-[#C28E58] font-bold"
                                  : "border-transparent hover:bg-white/50 dark:hover:bg-[#27231F]/50"
                              }`}
                            >
                              <span className="truncate pr-2">{pkg.name}</span>
                              <span className="text-emerald-700 dark:text-emerald-400 shrink-0">
                                {formatVnd(pkg.price)}
                              </span>
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutItem({
                              orderType: "FAAS_RENTAL",
                              packageId: selectedPkg.id,
                              itemName: `${selectedPkg.name} (${selectedTray.trayCode})`,
                              subtitle: `Định danh ${selectedTray.trayCode} • Chu kỳ ${selectedPkg.duration}`,
                              grossAmount: selectedPkg.price,
                              durationLabel: selectedPkg.duration,
                              yieldCommitment: selectedPkg.yieldText,
                            })
                          }
                          className="w-full py-2.5 rounded-xl bg-[#24170E] hover:bg-[#382417] dark:bg-[#C28E58] dark:text-[#1E1B18] text-white text-xs font-bold transition cursor-pointer"
                        >
                          Thuê Đúng Khay Này →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode("2d")}
                    className="w-full py-2.5 rounded-xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition cursor-pointer"
                  >
                    Xem &amp; Chọn Từng Khay Trong {selectedRoom?.roomCode || "RM01"} →
                  </button>
                )}

                {isAuthenticated && (
                  <Link
                    href="/khay-cua-toi"
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold text-center block transition"
                  >
                    Khay Nấm Của Tôi ({ownedTrayCodes.size}) →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <CheckoutGatewayModal
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onTransactionSuccess={() => {
          loadFarmData();
        }}
      />
    </main>
  );
}
