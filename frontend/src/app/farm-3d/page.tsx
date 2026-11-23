'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

type LayerKey = "exterior" | "cutaway" | "corridor" | "tray" | "iot";

interface PeelLayer {
  key: LayerKey;
  code: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  image: string;
  origin: string;
  specs: Array<{ label: string; value: string }>;
}

const PEEL_LAYERS: PeelLayer[] = [
  {
    key: "exterior",
    code: "01",
    shortTitle: "Ngoại Thất",
    title: "Lớp 01 • Vỏ Kiến Trúc & Kính Cleanroom",
    subtitle: "Toàn cảnh khu nhà kính nhôm Champagne cách nhiệt, bấm vào ô kính để tách mái vào trong.",
    image: "/images/farm3d/exterior-facility.jpg",
    origin: "58% 54%",
    specs: [
      { label: "Kết cấu", value: "Kính 2 lớp" },
      { label: "Tiêu chuẩn", value: "ISO Class 5" },
      { label: "Chênh áp", value: "+15 Pa" },
    ],
  },
  {
    key: "cutaway",
    code: "02",
    shortTitle: "Tách Mái 3D",
    title: "Lớp 02 • Bóc Tách Mái: 3 Buồng Nuôi",
    subtitle: "Mở lớp mái toàn khu để quan sát 3 phân khu RM01, RM02, RM03. Bấm vào buồng để bay vào hành lang.",
    image: "/images/farm3d/overview-cutaway.jpg",
    origin: "50% 45%",
    specs: [
      { label: "Số buồng", value: "3 Buồng" },
      { label: "Hệ kệ", value: "5 Tầng Thép" },
      { label: "Tổng công suất", value: "120+ Khay" },
    ],
  },
  {
    key: "corridor",
    code: "03",
    shortTitle: "Hành Lang Kệ",
    title: "Lớp 03 • Bên Trong Hành Lang Phòng Sạch",
    subtitle: "Đi sâu vào giữa 2 dãy kệ 5 tầng vô trùng với hệ thống phun sương và đèn quang phổ.",
    image: "/images/hero-view-facility-multitier.jpg",
    origin: "50% 50%",
    specs: [
      { label: "Lọc khí", value: "HEPA H13" },
      { label: "Phun sương", value: "Nano 5µm" },
      { label: "Độ ẩm", value: "85–95% RH" },
    ],
  },
  {
    key: "tray",
    code: "04",
    shortTitle: "Cận Cảnh Khay",
    title: "Lớp 04 • Cận Cảnh Khay Nấm & Quả Thể",
    subtitle: "Quan sát chi tiết khối phôi hữu cơ và quả thể nấm đang sinh trưởng trên từng khay.",
    image: "/images/hero-view-mushroom-macro.jpg",
    origin: "50% 55%",
    specs: [
      { label: "Chứng nhận", value: "VietGAP" },
      { label: "Định danh", value: "QR Vật Lý" },
      { label: "Chu kỳ", value: "30–90 Ngày" },
    ],
  },
  {
    key: "iot",
    code: "05",
    shortTitle: "IoT & Quang Phổ",
    title: "Lớp 05 • Hệ Thống Cảm Biến IoT & Đèn LED",
    subtitle: "Tách riêng lớp công nghệ điều khiển vi khí hậu 5 giây/lần và quang phổ LED 5000K / UV-C.",
    image: "/images/farm3d/iot-spectrum-cleanroom.jpg",
    origin: "50% 50%",
    specs: [
      { label: "Cảm biến", value: "LoRaWAN 5s" },
      { label: "Quang phổ", value: "5000K / UV-C" },
      { label: "Cảnh báo", value: "Trigger SQL" },
    ],
  },
];

const CUTAWAY_ROOM_PINS = [
  { left: "26%", top: "32%" },
  { left: "48%", top: "36%" },
  { left: "72%", top: "43%" },
];

const EXTERIOR_ROOM_PINS = [
  { left: "54%", top: "48%" },
  { left: "63%", top: "57%" },
  { left: "72%", top: "65%" },
];

const RENTAL_PACKAGES = [
  { id: 1, name: "Gói Nấm Bào Ngư Xám Nhật", price: 299000, duration: "30 Ngày", yieldText: "~3.5 kg nấm tươi" },
  { id: 2, name: "Gói Nấm Linh Chi Đỏ Luxury", price: 899000, duration: "90 Ngày", yieldText: "~1.8 kg linh chi" },
  { id: 3, name: "Gói Đông Trùng Hạ Thảo", price: 1899000, duration: "60 Ngày", yieldText: "~0.8 kg sinh khối" },
];

const DEFAULT_FARM_ROOMS: FarmRoom[] = [
  {
    roomId: 1,
    roomCode: "RM01",
    roomName: "Buồng Bào Ngư Xám Nhật (CNC)",
    totalTrays: 50,
    occupiedTrays: 38,
    availableTrays: 10,
    tempMin: 20,
    tempMax: 25,
    humidityMin: 85,
    humidityMax: 95,
  },
  {
    roomId: 2,
    roomCode: "RM02",
    roomName: "Buồng Nấm Hầu Thủ Vi Khí Hậu",
    totalTrays: 50,
    occupiedTrays: 35,
    availableTrays: 12,
    tempMin: 18,
    tempMax: 22,
    humidityMin: 88,
    humidityMax: 95,
  },
  {
    roomId: 3,
    roomCode: "RM03",
    roomName: "Buồng Đông Trùng & Linh Chi Dược Liệu",
    totalTrays: 50,
    occupiedTrays: 42,
    availableTrays: 6,
    tempMin: 18,
    tempMax: 22,
    humidityMin: 80,
    humidityMax: 85,
  },
];

const DEFAULT_FARM_TRAYS: FarmTray[] = [
  ...Array.from({ length: 50 }, (_, i) => ({
    trayId: i + 1,
    trayCode: `TRAY-RM01-R${String((i % 10) + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
    roomId: 1,
    rackNumber: (i % 10) + 1,
    shelfLevel: Math.floor(i / 10) + 1,
    positionNumber: 1,
    status: i % 17 === 0 ? "MAINTENANCE" : i % 5 === 0 ? "AVAILABLE" : "OCCUPIED",
    speciesName: "Nấm bào ngư xám",
  })),
  ...Array.from({ length: 50 }, (_, i) => ({
    trayId: 100 + i + 1,
    trayCode: `TRAY-RM02-R${String((i % 10) + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
    roomId: 2,
    rackNumber: (i % 10) + 1,
    shelfLevel: Math.floor(i / 10) + 1,
    positionNumber: 1,
    status: i % 17 === 0 ? "MAINTENANCE" : i % 4 === 0 ? "AVAILABLE" : "OCCUPIED",
    speciesName: "Nấm hầu thủ (Lion's Mane)",
  })),
  ...Array.from({ length: 50 }, (_, i) => ({
    trayId: 200 + i + 1,
    trayCode: `TRAY-RM03-R${String((i % 10) + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
    roomId: 3,
    rackNumber: (i % 10) + 1,
    shelfLevel: Math.floor(i / 10) + 1,
    positionNumber: 1,
    status: i % 17 === 0 ? "MAINTENANCE" : i % 6 === 0 ? "AVAILABLE" : "OCCUPIED",
    speciesName: i % 2 === 0 ? "Đông trùng hạ thảo" : "Nấm linh chi đỏ",
  })),
];

export default function Farm3DPage() {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<FarmRoom[]>(DEFAULT_FARM_ROOMS);
  const [trays, setTrays] = useState<FarmTray[]>(DEFAULT_FARM_TRAYS);
  const [ownedTrayCodes, setOwnedTrayCodes] = useState<Set<string>>(new Set());

  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [activeLayerKey, setActiveLayerKey] = useState<LayerKey>("cutaway");
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

      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value) && roomsRes.value.length > 0) {
        setRooms(roomsRes.value);
        setSelectedRoomId((prev) =>
          roomsRes.value.some((r: FarmRoom) => r.roomId === prev)
            ? prev
            : roomsRes.value[0].roomId
        );
      }

      if (traysRes.status === "fulfilled" && Array.isArray(traysRes.value) && traysRes.value.length > 0) {
        const list: FarmTray[] = traysRes.value;
        setTrays(list);
        if (typeof window !== "undefined") {
          const code = new URLSearchParams(window.location.search).get("tray");
          if (code) {
            const found = list.find((t) => t.trayCode === code);
            if (found) {
              setSelectedTray(found);
              setSelectedRoomId(found.roomId);
              setActiveLayerKey("tray");
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

  const activeLayerIndex = useMemo(
    () => PEEL_LAYERS.findIndex((l) => l.key === activeLayerKey),
    [activeLayerKey]
  );

  const activeLayer = PEEL_LAYERS[activeLayerIndex] || PEEL_LAYERS[1];

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

  const getLayerImage = () => {
    if (activeLayerKey === "tray" && selectedTray?.speciesName) {
      const s = selectedTray.speciesName.toLowerCase();
      if (s.includes("linh chi")) return "/images/hero-chamber-warm-champagne.jpg";
      if (s.includes("đông trùng") || s.includes("hạ thảo")) {
        return "/images/hero-chamber-light-latte.jpg";
      }
    }
    return activeLayer.image;
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
                Bóc tách từng lớp kiến trúc từ <strong className="text-[#C28E58]">Ngoại thất → Tách mái → Hành lang → Khay nấm → IoT</strong>.
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
                Sơ Đồ Khay ({roomTrays.length})
              </button>
            </div>
          </div>

          {/* Khung chính: Sân khấu bóc tách từng lớp (8 cột) + Panel dữ liệu SQL Server (4 cột) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 space-y-3">
              {viewMode === "3d" ? (
                <>
                  <div className="relative w-full h-[470px] sm:h-[550px] rounded-3xl overflow-hidden border border-[#DECFC0] dark:border-[#474039] shadow-xl bg-[#1E1B18]">
                    {/* Chuyển lớp bóc tách mượt mà chuẩn THE SOLENNE */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeLayer.key}-${selectedTray?.trayId || "none"}`}
                        initial={{ opacity: 0, scale: 1.15 }}
                        animate={{ opacity: 1, scale: 1.0 }}
                        exit={{ opacity: 0, scale: 1.35 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: activeLayer.origin }}
                        className="w-full h-full relative"
                      >
                        <img
                          src={getLayerImage()}
                          alt={activeLayer.title}
                          className={`w-full h-full object-cover transition-all duration-500 ${lightingFilter}`}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Nhãn tương tác trên Lớp 01 (Ngoại thất) -> bấm để tách mái vào Lớp 02 */}
                    {activeLayerKey === "exterior" &&
                      rooms.slice(0, 3).map((room, idx) => {
                        const pos = EXTERIOR_ROOM_PINS[idx] || EXTERIOR_ROOM_PINS[0];
                        return (
                          <button
                            key={room.roomId}
                            type="button"
                            onClick={() => {
                              setSelectedRoomId(room.roomId);
                              setSelectedTray(null);
                              setActiveLayerKey("cutaway");
                            }}
                            style={{ left: pos.left, top: pos.top }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3 py-1.5 rounded-2xl bg-[#24170E]/90 hover:bg-[#24170E] text-white border border-[#E2BA78] shadow-xl transition hover:scale-105 cursor-pointer flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-mono text-[11px] font-black text-[#E2BA78]">
                              {room.roomCode}
                            </span>
                            <span className="text-[11px] font-semibold">Tách mái →</span>
                          </button>
                        );
                      })}

                    {/* Nhãn tương tác trên Lớp 02 (Tách mái 3D) -> bấm để bay vào Lớp 03 */}
                    {activeLayerKey === "cutaway" &&
                      rooms.slice(0, 3).map((room, idx) => {
                        const pos = CUTAWAY_ROOM_PINS[idx] || CUTAWAY_ROOM_PINS[0];
                        const isSelected = selectedRoomId === room.roomId;
                        return (
                          <button
                            key={room.roomId}
                            type="button"
                            onClick={() => {
                              setSelectedRoomId(room.roomId);
                              setSelectedTray(null);
                              setActiveLayerKey("corridor");
                            }}
                            style={{ left: pos.left, top: pos.top }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-lg transition hover:scale-105 cursor-pointer flex items-center gap-2 ${
                              isSelected
                                ? "bg-[#24170E]/95 text-white border-[#E2BA78]"
                                : "bg-white/95 text-[#24170E] border-[#DECFC0] hover:border-[#C28E58]"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-black">{room.roomCode}</span>
                            <span className="text-[10px] opacity-80">
                              {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay • Vào →
                            </span>
                          </button>
                        );
                      })}

                    {/* Dải chọn khay nhanh khi đang ở Lớp 03 (Hành lang kệ) */}
                    {activeLayerKey === "corridor" && roomTrays.length > 0 && (
                      <div className="absolute top-3 left-3 right-3 z-20 p-2.5 rounded-2xl bg-[#24170E]/88 backdrop-blur-md border border-white/15 text-white flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-[11px] font-bold text-[#E2BA78] shrink-0 px-1.5">
                          Chọn khay zoom:
                        </span>
                        {roomTrays.slice(0, 12).map((t) => (
                          <button
                            key={t.trayId}
                            type="button"
                            onClick={() => {
                              setSelectedTray(t);
                              setActiveLayerKey("tray");
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border shrink-0 transition cursor-pointer ${
                              ownedTrayCodes.has(t.trayCode)
                                ? "bg-[#E2BA78] text-[#1E1B18] border-white"
                                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                            }`}
                          >
                            {t.trayCode.replace("TRAY-", "")}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Nút lùi / tiến lớp ở góc dưới phải */}
                    <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
                      <button
                        type="button"
                        disabled={activeLayerIndex <= 0}
                        onClick={() => {
                          if (activeLayerIndex > 0) {
                            setActiveLayerKey(PEEL_LAYERS[activeLayerIndex - 1].key);
                          }
                        }}
                        className="px-3.5 py-2 rounded-full bg-[#24170E]/90 hover:bg-[#24170E] disabled:opacity-40 text-white border border-white/25 text-xs font-bold shadow-lg transition cursor-pointer backdrop-blur-md"
                      >
                        ← Lớp trước
                      </button>
                      <button
                        type="button"
                        disabled={activeLayerIndex >= PEEL_LAYERS.length - 1}
                        onClick={() => {
                          if (activeLayerIndex < PEEL_LAYERS.length - 1) {
                            setActiveLayerKey(PEEL_LAYERS[activeLayerIndex + 1].key);
                          }
                        }}
                        className="px-3.5 py-2 rounded-full bg-[#C28E58] hover:bg-[#D4A16A] disabled:opacity-40 text-[#1E1B18] text-xs font-black shadow-lg transition cursor-pointer backdrop-blur-md"
                      >
                        Bóc lớp tiếp →
                      </button>
                    </div>
                  </div>

                  {/* Thanh 5 bước bóc tách kiến trúc */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PEEL_LAYERS.map((layer) => {
                      const isActive = activeLayerKey === layer.key;
                      return (
                        <button
                          key={layer.key}
                          type="button"
                          onClick={() => setActiveLayerKey(layer.key)}
                          className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                            isActive
                              ? "bg-[#24170E] text-white border-[#C28E58] shadow-md"
                              : "bg-white dark:bg-[#27231F] text-[#24170E] dark:text-[#F7EFE6] border-[#EAE1D3] dark:border-[#474039] hover:border-[#C28E58]"
                          }`}
                        >
                          <span className="font-mono text-[10px] font-black text-[#C28E58] block">
                            LỚP {layer.code}
                          </span>
                          <span className="text-[11px] font-bold block truncate mt-0.5">
                            {layer.shortTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="w-full min-h-[550px] rounded-3xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] p-5 shadow-xl space-y-4">
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#6B442C] dark:text-[#E2BA78]">
                          {selectedTray.trayCode}
                        </span>
                        <span className="text-[11px] font-bold text-[#8A5C38] dark:text-[#BFA895]">
                          Kệ {selectedTray.rackNumber} • Tầng {selectedTray.shelfLevel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTray(null)}
                        className="text-[10px] font-bold text-[#8C6D53] hover:text-rose-600 transition underline cursor-pointer"
                        title="Bỏ chọn khay"
                      >
                        Bỏ chọn
                      </button>
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
                    onClick={() => {
                      setViewMode("2d");
                      const firstAvailable =
                        roomTrays.find((t) => t.status === "AVAILABLE") || roomTrays[0];
                      if (firstAvailable) {
                        setSelectedTray(firstAvailable);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs"
                  >
                    <span>Xem &amp; Chọn Từng Khay Trong {selectedRoom?.roomCode || "RM01"}</span>
                    <span>→</span>
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
