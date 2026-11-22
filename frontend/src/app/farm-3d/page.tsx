'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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

interface BreakdownLayer {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  left: string;
  top: string;
  origin: string;
  roomIndex?: number;
  specs: Array<{ label: string; value: string }>;
}

const BREAKDOWN_LAYERS: BreakdownLayer[] = [
  {
    id: "rm01",
    code: "01",
    title: "Buồng RM01 • Bào Ngư Xám",
    subtitle: "Hệ giàn kệ thép 5 tầng chuẩn phòng sạch",
    left: "26%",
    top: "33%",
    origin: "26% 38%",
    roomIndex: 0,
    specs: [
      { label: "Nhiệt độ chuẩn", value: "22–25 °C" },
      { label: "Độ ẩm tối ưu", value: "85–92 % RH" },
      { label: "Chu kỳ thu hoạch", value: "30 Ngày" },
    ],
  },
  {
    id: "rm02",
    code: "02",
    title: "Buồng RM02 • Nấm Hầu Thủ",
    subtitle: "Phân khu dược liệu kiểm soát CO₂ chặt chẽ",
    left: "48%",
    top: "37%",
    origin: "49% 42%",
    roomIndex: 1,
    specs: [
      { label: "Nhiệt độ chuẩn", value: "20–24 °C" },
      { label: "Độ ẩm tối ưu", value: "88–95 % RH" },
      { label: "Giới hạn CO₂", value: "< 800 ppm" },
    ],
  },
  {
    id: "rm03",
    code: "03",
    title: "Buồng RM03 • Linh Chi Đỏ",
    subtitle: "Phân khu thảo dược cao cấp 90 ngày",
    left: "72%",
    top: "43%",
    origin: "72% 48%",
    roomIndex: 2,
    specs: [
      { label: "Nhiệt độ chuẩn", value: "24–28 °C" },
      { label: "Độ ẩm tối ưu", value: "85–90 % RH" },
      { label: "Chu kỳ thu hoạch", value: "90 Ngày" },
    ],
  },
  {
    id: "airlock",
    code: "04",
    title: "Sảnh Kính Airlock & Vỏ Cleanroom",
    subtitle: "Vách kính cường lực 2 lớp & cửa khóa áp suất dương",
    left: "37%",
    top: "68%",
    origin: "38% 66%",
    specs: [
      { label: "Cấp độ sạch", value: "ISO Class 5" },
      { label: "Lọc khí HEPA", value: "99.97% H13" },
      { label: "Chênh áp buồng", value: "+15 Pa" },
    ],
  },
  {
    id: "iot",
    code: "05",
    title: "Hệ Thống Đèn LED & Cảm Biến IoT",
    subtitle: "Đèn quang phổ 5000K + Phun sương siêu âm + LoRaWAN",
    left: "60%",
    top: "23%",
    origin: "58% 26%",
    specs: [
      { label: "Tần suất đo", value: "5 giây / lần" },
      { label: "Quang phổ LED", value: "5000K / UV-C" },
      { label: "Phun sương", value: "Hạt nano 5µm" },
    ],
  },
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
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [lightingMode, setLightingMode] = useState<"day" | "night" | "uvc">("day");
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

  const activeLayer = useMemo(
    () => BREAKDOWN_LAYERS.find((l) => l.id === activeLayerId) || null,
    [activeLayerId]
  );

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

  const handleSelectLayer = (layer: BreakdownLayer) => {
    if (activeLayerId === layer.id) {
      setActiveLayerId(null);
      return;
    }
    setActiveLayerId(layer.id);
    if (typeof layer.roomIndex === "number" && rooms[layer.roomIndex]) {
      setSelectedRoomId(rooms[layer.roomIndex].roomId);
      setSelectedTray(null);
    }
  };

  const lightingFilter =
    lightingMode === "uvc"
      ? "hue-rotate-[215deg] saturate-150 brightness-90"
      : lightingMode === "night"
      ? "brightness-75 contrast-110 sepia-[0.2]"
      : "brightness-100";

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] flex flex-col justify-between font-sans transition-colors">
      <div>
        <Navbar />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-4">
          {/* Thanh tiêu đề & bộ điều khiển */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#24170E] dark:text-white">
                Mô Hình Trang Trại Nấm 3D
              </h1>
              <p className="text-xs sm:text-sm text-[#735843] dark:text-[#BFA895] mt-1">
                Bấm vào từng điểm bóc tách <strong className="text-[#C28E58]">01 → 05</strong> trên mô hình để phóng to chi tiết từng phân khu và thuê khay trực tiếp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {viewMode === "3d" && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF5EE] dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039]">
                  {(["day", "night", "uvc"] as const).map((lm) => (
                    <button
                      key={lm}
                      type="button"
                      onClick={() => setLightingMode(lm)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        lightingMode === lm
                          ? "bg-[#24170E] text-[#E2BA78]"
                          : "text-[#5E4A3A] dark:text-[#DAC7B5]"
                      }`}
                    >
                      {lm === "day" ? "Ngày 5000K" : lm === "night" ? "Đêm Ấm" : "UV-C"}
                    </button>
                  ))}
                </div>
              )}

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

          {/* Khung chính: Mô hình đơn sắc nét có hiệu ứng zoom bóc tách (8 cột) + Panel thông tin (4 cột) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 space-y-3">
              {viewMode === "3d" ? (
                <>
                  <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden border border-[#DECFC0] dark:border-[#474039] shadow-xl bg-[#F3EDE3] dark:bg-[#1E1B18]">
                    {/* Mô hình 3D sắc nét với hiệu ứng Zoom mượt khóa đúng tâm bộ phận bóc tách */}
                    <motion.div
                      animate={{
                        scale: activeLayer ? 1.52 : 1,
                      }}
                      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        transformOrigin: activeLayer ? activeLayer.origin : "50% 50%",
                      }}
                      className="w-full h-full relative"
                    >
                      <img
                        src="/images/farm3d/overview-cutaway.jpg"
                        alt="Mô hình trang trại nấm MushroomCloud 3D"
                        className={`w-full h-full object-cover transition-all duration-500 ${lightingFilter}`}
                      />

                      {/* 5 Điểm Hotspot bóc tách từng bộ phận trên mô hình (chỉ hiện ở Toàn cảnh để không bị phóng to hay cắt mép khi zoom) */}
                      {!activeLayer &&
                        BREAKDOWN_LAYERS.map((layer) => {
                          const room =
                            typeof layer.roomIndex === "number"
                              ? rooms[layer.roomIndex]
                              : undefined;
                          return (
                            <button
                              key={layer.id}
                              type="button"
                              onClick={() => handleSelectLayer(layer)}
                              style={{ left: layer.left, top: layer.top }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 px-2.5 py-1.5 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 bg-white/95 text-[#24170E] border-[#DECFC0] hover:border-[#C28E58]"
                            >
                              <span className="w-5 h-5 rounded-full font-mono text-[10px] font-black flex items-center justify-center shrink-0 bg-[#24170E] text-[#E2BA78]">
                                {layer.code}
                              </span>
                              <span className="text-[11px] font-bold whitespace-nowrap">
                                {room
                                  ? `${room.roomCode} (${room.occupiedTrays ?? 0}/${room.totalTrays ?? 0})`
                                  : layer.id === "airlock"
                                  ? "Airlock & Kính"
                                  : "IoT & LED"}
                              </span>
                            </button>
                          );
                        })}
                    </motion.div>

                    {/* Nút thu nhỏ về toàn cảnh khi đang zoom bóc tách */}
                    {activeLayer && (
                      <button
                        type="button"
                        onClick={() => setActiveLayerId(null)}
                        className="absolute top-3 left-3 z-30 px-3.5 py-1.5 rounded-full bg-[#24170E]/90 hover:bg-[#24170E] text-white border border-[#E2BA78]/60 text-xs font-bold shadow-lg transition cursor-pointer"
                      >
                        ← Thu nhỏ toàn cảnh
                      </button>
                    )}

                    {/* Thẻ kính mờ tóm tắt lớp đang bóc tách */}
                    {activeLayer && (
                      <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 z-30 p-4 rounded-2xl bg-[#24170E]/95 backdrop-blur-md border border-[#E2BA78]/60 text-white shadow-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-black text-[#E2BA78]">
                            BÓC TÁCH LỚP {activeLayer.code}
                          </span>
                          <span className="text-[10px] text-emerald-300 font-bold">
                            Đang hoạt động
                          </span>
                        </div>
                        <p className="text-sm font-black">{activeLayer.title}</p>
                        <p className="text-[11px] text-stone-300">{activeLayer.subtitle}</p>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {activeLayer.specs.map((sp) => (
                            <div
                              key={sp.label}
                              className="p-1.5 rounded-lg bg-white/10 text-center"
                            >
                              <span className="text-[9px] text-stone-300 block">
                                {sp.label}
                              </span>
                              <strong className="text-[10px] font-bold text-[#E2BA78]">
                                {sp.value}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thanh chọn nhanh 5 lớp bóc tách ngay dưới mô hình */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {BREAKDOWN_LAYERS.map((layer) => {
                      const isActive = activeLayerId === layer.id;
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          onClick={() => handleSelectLayer(layer)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                            isActive
                              ? "bg-[#24170E] text-white border-[#C28E58] shadow-md"
                              : "bg-white dark:bg-[#27231F] text-[#24170E] dark:text-[#F7EFE6] border-[#EAE1D3] dark:border-[#474039] hover:border-[#C28E58]"
                          }`}
                        >
                          <span className="font-mono text-[10px] font-black text-[#C28E58] block">
                            {layer.code}
                          </span>
                          <span className="text-[11px] font-bold block truncate mt-0.5">
                            {layer.title.split("•")[0].trim()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="w-full min-h-[540px] rounded-3xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] p-5 shadow-xl space-y-4">
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
