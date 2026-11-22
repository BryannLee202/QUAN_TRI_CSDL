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
import Farm3DScene from "@/components/farm3d/Farm3DScene";
import SolenneScrollTour from "@/components/farm3d/SolenneScrollTour";
import type {
  Farm3DRoom,
  Farm3DTray,
  CameraMode,
  LightingMode,
} from "@/components/farm3d/Farm3DCanvas";
import CheckoutGatewayModal, {
  CheckoutItemConfig,
} from "@/components/checkout/CheckoutGatewayModal";

const RENTAL_PACKAGES: Array<{
  id: number;
  code: string;
  name: string;
  price: number;
  duration: string;
  yieldText: string;
}> = [
  {
    id: 1,
    code: "01",
    name: "Gói Nấm Bào Ngư Xám Nhật",
    price: 299000,
    duration: "30 Ngày",
    yieldText: "~3.5 kg nấm tươi",
  },
  {
    id: 2,
    code: "02",
    name: "Gói Nấm Linh Chi Đỏ Luxury",
    price: 899000,
    duration: "90 Ngày",
    yieldText: "~1.8 kg linh chi",
  },
  {
    id: 3,
    code: "03",
    name: "Gói Đông Trùng Hạ Thảo",
    price: 1899000,
    duration: "60 Ngày",
    yieldText: "~0.8 kg sinh khối",
  },
];

const TOUR_STEPS = [
  {
    step: "01",
    title: "Ngoại Thất Khu Agritech Center",
    desc: "Toàn cảnh kiến trúc nhà kính vách nhôm champagne giữa khuôn viên xanh.",
  },
  {
    step: "02",
    title: "Tách Lớp Isometric 3 Buồng Nuôi",
    desc: "Mở lớp mái nhìn xuyên 3 buồng RM01, RM02, RM03 kết nối trực tiếp SQL Server.",
  },
  {
    step: "03",
    title: "Hành Lang Giàn Kệ 5 Tầng",
    desc: "Không gian phòng sạch ISO Class 5 với đèn quang phổ và phun sương siêu âm.",
  },
  {
    step: "04",
    title: "Cận Cảnh Khay Nấm & 3 Hotspot IoT",
    desc: "Kiểm tra trực tiếp khối phôi, đầu dò cảm biến LoRaWAN và đèn LED quang phổ.",
  },
];

const HOTSPOT_DETAILS: Record<
  number,
  { code: string; title: string; spec: string; note: string }
> = {
  1: {
    code: "01",
    title: "Khối Phôi & Quả Thể Nấm",
    spec: "Giống hữu cơ chuẩn VietGAP",
    note: "Phôi nấm vô trùng được kiểm tra tự động qua camera mỗi 12 giờ.",
  },
  2: {
    code: "02",
    title: "Nút Cảm Biến IoT LoRaWAN",
    spec: "23.6°C • 89.5% RH • 610 ppm CO₂",
    note: "Đồng bộ dữ liệu chuỗi thời gian về SensorData mỗi 5 giây.",
  },
  3: {
    code: "03",
    title: "Thanh Đèn Quang Phổ & UV-C",
    spec: "LED 5000K / Khử khuẩn chu kỳ",
    note: "Điều chỉnh phổ ánh sáng kích thích mũ nấm bung tán đồng đều.",
  },
};

export default function Farm3DPage() {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Farm3DRoom[]>([]);
  const [trays, setTrays] = useState<Farm3DTray[]>([]);
  const [ownedTrayCodes, setOwnedTrayCodes] = useState<Set<string>>(new Set());

  const [cameraMode, setCameraMode] = useState<CameraMode>("overview");
  const [tourStep, setTourStep] = useState<number>(0);
  const [lightingMode, setLightingMode] = useState<LightingMode>("day");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedTray, setSelectedTray] = useState<Farm3DTray | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<number>(1);
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
      }

      if (traysRes.status === "fulfilled" && Array.isArray(traysRes.value)) {
        const trayList: Farm3DTray[] = traysRes.value;
        setTrays(trayList);

        // Nếu URL có ?tray=TRAY-..., tự động bay tới đúng khay đó
        if (typeof window !== "undefined") {
          const code = new URLSearchParams(window.location.search).get("tray");
          if (code) {
            const found = trayList.find((t) => t.trayCode === code);
            if (found) {
              setSelectedTray(found);
              setSelectedRoomId(found.roomId);
              setCameraMode("tray");
              setTimeout(() => {
                document.getElementById("interactive-farm-3d")?.scrollIntoView({ behavior: "smooth" });
              }, 120);
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

  const handleSelectRoom = (roomId: number) => {
    setSelectedRoomId(roomId);
    setSelectedTray(null);
    setCameraMode("room");
  };

  const handleSelectTray = (tray: Farm3DTray) => {
    setSelectedTray(tray);
    setSelectedRoomId(tray.roomId);
    setCameraMode("tray");
  };

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.roomId === selectedRoomId) || rooms[0] || null,
    [rooms, selectedRoomId]
  );

  const selectedPkg = useMemo(
    () => RENTAL_PACKAGES.find((p) => p.id === selectedPkgId) || RENTAL_PACKAGES[0],
    [selectedPkgId]
  );

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + " VNĐ";

  const isSelectedOwned = Boolean(
    selectedTray && ownedTrayCodes.has(selectedTray.trayCode)
  );

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] transition-colors flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        {/* Phần 1: Trải nghiệm cuộn bóc tách từng phần 3D + Video Scroll-Scrubbing */}
        <SolenneScrollTour
          rooms={rooms}
          trays={trays}
          ownedTrayCodes={ownedTrayCodes}
          onJumpToInteractive={() => {
            document
              .getElementById("interactive-farm-3d")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <div id="interactive-farm-3d" className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-4">
          {/* Thanh điều khiển nổi phía trên (Phong cách Dormer + MyFarm3D) */}
          <div className="rounded-2xl p-3 sm:p-4 bg-white/90 dark:bg-[#27231F]/90 backdrop-blur-md border border-[#EAE1D3] dark:border-[#474039] shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#24170E] dark:text-white tracking-tight">
                Mô Hình Trang Trại Nấm 3D Thực Tế
              </h1>
              <p className="text-xs text-[#735843] dark:text-[#BFA895]">
                Kéo để xoay 360°, cuộn để phóng to, bấm vào buồng hoặc từng khay để bay thẳng tới vị trí thật.
              </p>
            </div>

            {/* Nhóm nút Góc Nhìn Camera */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "overview", label: "Toàn Cảnh 3D" },
                { key: "top2d", label: "Sơ Đồ 2D" },
                { key: "tour", label: "Lướt Chuyển Cảnh" },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setCameraMode(m.key as CameraMode);
                    if (m.key === "overview" || m.key === "top2d") {
                      setSelectedTray(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    cameraMode === m.key
                      ? "bg-[#24170E] text-white border-[#C28E58] dark:bg-[#C28E58] dark:text-[#1E1B18]"
                      : "bg-[#FAF5EE] dark:bg-[#322D28] text-[#5E4A3A] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58]"
                  }`}
                >
                  {m.label}
                </button>
              ))}

              <span className="h-5 w-px bg-[#DECFC0] dark:bg-[#474039] mx-1 hidden sm:inline-block" />

              {/* Nhóm nút Buồng Nuôi */}
              {rooms.map((r) => (
                <button
                  key={r.roomId}
                  type="button"
                  onClick={() => handleSelectRoom(r.roomId)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    cameraMode === "room" && selectedRoomId === r.roomId
                      ? "bg-emerald-700 text-white border-emerald-500"
                      : "bg-white dark:bg-[#1E1B18] text-[#4A3222] dark:text-[#E2BA78] border-[#DECFC0] dark:border-[#474039] hover:border-emerald-500"
                  }`}
                >
                  {r.roomCode}
                </button>
              ))}

              <span className="h-5 w-px bg-[#DECFC0] dark:bg-[#474039] mx-1 hidden sm:inline-block" />

              {/* Nhóm nút Ánh sáng */}
              {[
                { key: "day", label: "Ngày 5000K" },
                { key: "night", label: "Đêm Ấm" },
                { key: "uvc", label: "UV-C" },
              ].map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLightingMode(l.key as LightingMode)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                    lightingMode === l.key
                      ? "bg-amber-100 dark:bg-[#3B2A1E] text-[#6B442C] dark:text-[#E2BA78] border-[#C28E58]"
                      : "bg-transparent text-[#735843] dark:text-[#BFA895] border-[#EAE1D3] dark:border-[#474039]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Khung chính: Sân khấu 3D (8 cột) + Bảng Kính Mờ & Biên Lai (4 cột) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 h-[540px] sm:h-[620px] relative">
              <Farm3DScene
                rooms={rooms}
                trays={trays}
                ownedTrayCodes={ownedTrayCodes}
                selectedRoomId={selectedRoomId}
                selectedTray={selectedTray}
                cameraMode={cameraMode}
                tourStep={tourStep}
                lightingMode={lightingMode}
                activeHotspot={activeHotspot}
                onSelectRoom={handleSelectRoom}
                onSelectTray={handleSelectTray}
                onSelectHotspot={(id) => setActiveHotspot(id)}
              />

              {/* Chú thích màu khay góc dưới trái */}
              <div className="absolute bottom-3 left-3 px-3 py-2 rounded-2xl bg-white/85 dark:bg-[#1E1B18]/85 backdrop-blur-md border border-[#DECFC0] dark:border-[#474039] flex flex-wrap items-center gap-3 text-[11px] font-bold shadow-sm pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E2BA78] border border-[#92400E]" />
                  Khay của bạn
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  Đang nuôi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E7DFD3] border border-[#BFA895]" />
                  Khay trống
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                  Bảo trì
                </span>
              </div>

              {/* Thanh điều khiển Lướt Chuyển Cảnh (Reel 2 & Reel 3) */}
              {cameraMode === "tour" && (
                <div
                  onWheel={(e) => {
                    if (e.deltaY > 0) {
                      setTourStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1));
                    } else if (e.deltaY < 0) {
                      setTourStep((s) => Math.max(0, s - 1));
                    }
                  }}
                  className="absolute bottom-3 right-3 left-3 sm:left-auto sm:w-96 p-3.5 rounded-2xl bg-[#24170E]/92 backdrop-blur-md border border-[#C28E58]/60 text-white shadow-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-black text-[#E2BA78]">
                      CẢNH {TOUR_STEPS[tourStep].step} / 0{TOUR_STEPS.length}
                    </span>
                    <span className="text-stone-300">Cuộn hoặc bấm chuyển cảnh</span>
                  </div>
                  <p className="text-sm font-bold">{TOUR_STEPS[tourStep].title}</p>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {TOUR_STEPS[tourStep].desc}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      disabled={tourStep === 0}
                      onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-35 text-xs font-bold cursor-pointer"
                    >
                      ← Trước
                    </button>
                    <div className="flex items-center gap-1">
                      {TOUR_STEPS.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTourStep(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            tourStep === idx ? "w-5 bg-[#E2BA78]" : "w-1.5 bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={tourStep === TOUR_STEPS.length - 1}
                      onClick={() =>
                        setTourStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1))
                      }
                      className="px-3 py-1 rounded-lg bg-[#C28E58] hover:bg-[#D4A16A] text-[#1E1B18] disabled:opacity-35 text-xs font-bold cursor-pointer"
                    >
                      Tiếp →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cột phải: Bảng Kính Mờ Chi Tiết + Hotspot + Biên Lai Thuê Khay (Reel 1 & Reel 4) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {selectedTray ? (
                <div className="rounded-3xl bg-white dark:bg-[#27231F] border border-[#EAE1D3] dark:border-[#474039] p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-[#F2E8DC] dark:border-[#474039] pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-[#C28E58]">
                        {selectedTray.trayCode}
                      </span>
                      <h2 className="text-lg font-black text-[#24170E] dark:text-white mt-0.5">
                        {selectedTray.speciesName || "Khay Trống Sẵn Sàng"}
                      </h2>
                      <p className="text-xs text-[#735843] dark:text-[#BFA895]">
                        Kệ {selectedTray.rackNumber} • Tầng {selectedTray.shelfLevel} • Vị trí{" "}
                        {selectedTray.positionNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTray(null);
                        setCameraMode("overview");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] dark:bg-[#322D28] text-xs font-bold text-[#735843] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#474039] cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>

                  {/* Thẻ Hotspot đang chọn trên mô hình 3D (Reel 4) */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A5C38] dark:text-[#E2BA78]">
                        Điểm Hotspot Trên Khay
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setActiveHotspot(id)}
                            className={`w-6 h-6 rounded-full text-[10px] font-mono font-black border cursor-pointer ${
                              activeHotspot === id
                                ? "bg-[#24170E] text-[#E2BA78] border-[#C28E58]"
                                : "bg-white dark:bg-[#1E1B18] text-[#4A3222] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                            }`}
                          >
                            0{id}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#24170E] dark:text-white">
                      {HOTSPOT_DETAILS[activeHotspot].code}.{" "}
                      {HOTSPOT_DETAILS[activeHotspot].title}
                    </p>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {HOTSPOT_DETAILS[activeHotspot].spec}
                    </p>
                    <p className="text-[11px] text-[#735843] dark:text-[#DAC7B5]">
                      {HOTSPOT_DETAILS[activeHotspot].note}
                    </p>
                  </div>

                  {/* Nếu là khay của chính user đang đăng nhập */}
                  {isSelectedOwned && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-[#C28E58] space-y-3">
                      <p className="text-xs font-bold text-[#6B442C] dark:text-[#E2BA78]">
                        Đây là khay nấm thuộc quyền sở hữu của bạn!
                      </p>
                      <Link
                        href={`/khay-cua-toi?tray=${encodeURIComponent(selectedTray.trayCode)}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#24170E] hover:bg-[#382417] text-white text-xs font-bold text-center block transition"
                      >
                        Mở Trang Theo Dõi Khay Của Tôi →
                      </Link>
                    </div>
                  )}

                  {/* Nếu là khay trống: Hiện phiếu biên lai chọn gói phong cách Reel 4 */}
                  {selectedTray.status === "AVAILABLE" && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1B18] border border-dashed border-[#C28E58]/70 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-dashed border-[#DECFC0] dark:border-[#474039] pb-2">
                        <span className="font-bold text-[#24170E] dark:text-[#E2BA78]">
                          PHIẾU ĐĂNG KÝ KHAY {selectedTray.trayCode}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {RENTAL_PACKAGES.map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPkgId(pkg.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                              selectedPkgId === pkg.id
                                ? "bg-white dark:bg-[#27231F] border-[#C28E58] font-bold"
                                : "border-transparent hover:bg-white/60 dark:hover:bg-[#27231F]/60"
                            }`}
                          >
                            <span className="truncate pr-2">
                              {pkg.code} {pkg.name}
                            </span>
                            <span className="shrink-0 text-emerald-700 dark:text-emerald-400">
                              {formatVnd(pkg.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-dashed border-[#DECFC0] dark:border-[#474039] pt-2 flex items-center justify-between font-bold text-sm">
                        <span>TỔNG CỘNG</span>
                        <span className="text-[#C28E58]">{formatVnd(selectedPkg.price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCheckoutItem({
                            orderType: "FAAS_RENTAL",
                            packageId: selectedPkg.id,
                            itemName: `${selectedPkg.name} (${selectedTray.trayCode})`,
                            subtitle: `Định danh vật lý ${selectedTray.trayCode} • Chu kỳ ${selectedPkg.duration}`,
                            grossAmount: selectedPkg.price,
                            durationLabel: selectedPkg.duration,
                            yieldCommitment: selectedPkg.yieldText,
                          })
                        }
                        className="w-full py-3 rounded-xl bg-[#24170E] hover:bg-[#382417] dark:bg-[#C28E58] dark:text-[#1E1B18] text-white font-sans font-bold text-xs transition cursor-pointer"
                      >
                        THUÊ ĐÚNG KHAY NÀY NGAY →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl bg-white dark:bg-[#27231F] border border-[#EAE1D3] dark:border-[#474039] p-5 shadow-sm space-y-4">
                  <h2 className="text-base font-black text-[#24170E] dark:text-white">
                    {selectedRoom ? `${selectedRoom.roomCode} — ${selectedRoom.roomName}` : "Tổng Quan Trang Trại 3D"}
                  </h2>
                  <p className="text-xs text-[#735843] dark:text-[#DAC7B5] leading-relaxed">
                    Bấm trực tiếp vào từng buồng trên mô hình cắt lớp hoặc chọn <strong>khay nấm</strong> trong Sơ Đồ 2D để xem cận cảnh 3 điểm Hotspot IoT và đặt thuê trực tiếp.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#EAE1D3] dark:border-[#474039]">
                      <span className="text-[11px] text-[#8A5C38] dark:text-[#BFA895] block">
                        Tổng số khay
                      </span>
                      <strong className="text-lg font-black">{trays.length} khay</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#EAE1D3] dark:border-[#474039]">
                      <span className="text-[11px] text-[#8A5C38] dark:text-[#BFA895] block">
                        Khay của bạn
                      </span>
                      <strong className="text-lg font-black text-[#C28E58]">
                        {ownedTrayCodes.size} khay
                      </strong>
                    </div>
                  </div>
                  {isAuthenticated && (
                    <Link
                      href="/khay-cua-toi"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold text-center block transition"
                    >
                      Quản Lý Khay Nấm Của Tôi →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
