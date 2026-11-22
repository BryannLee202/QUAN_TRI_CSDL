'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Farm3DRoom {
  roomId: number;
  roomCode: string;
  roomName: string;
  totalTrays?: number;
  occupiedTrays?: number;
  availableTrays?: number;
  maintenanceTrays?: number;
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  co2Max?: number;
}

export interface Farm3DTray {
  trayId: number;
  trayCode: string;
  roomId: number;
  rackNumber: number;
  shelfLevel: number;
  positionNumber: number;
  status: string;
  speciesName?: string | null;
  inoculationDate?: string | null;
  expectedHarvestDate?: string | null;
  customerName?: string | null;
}

export type CameraMode = "overview" | "top2d" | "room" | "tray" | "tour";
export type LightingMode = "day" | "night" | "uvc";

interface Farm3DSceneProps {
  rooms: Farm3DRoom[];
  trays: Farm3DTray[];
  ownedTrayCodes: Set<string>;
  selectedRoomId: number | null;
  selectedTray: Farm3DTray | null;
  cameraMode: CameraMode;
  tourStep: number;
  lightingMode: LightingMode;
  activeHotspot: number;
  onSelectRoom: (roomId: number) => void;
  onSelectTray: (tray: Farm3DTray) => void;
  onSelectHotspot: (id: number) => void;
}

const ROOM_PILL_POSITIONS = [
  { left: "26%", top: "24%", zoomOrigin: "26% 42%" },
  { left: "48%", top: "30%", zoomOrigin: "50% 48%" },
  { left: "73%", top: "38%", zoomOrigin: "74% 52%" },
];

const HOTSPOT_PINS = [
  { id: 1, label: "01", title: "Khối Phôi & Quả Thể", left: "42%", top: "54%" },
  { id: 2, label: "02", title: "Cảm Biến IoT LoRaWAN", left: "74%", top: "48%" },
  { id: 3, label: "03", title: "Đèn Quang Phổ LED", left: "50%", top: "18%" },
];

export default function Farm3DScene({
  rooms,
  trays,
  ownedTrayCodes,
  selectedRoomId,
  selectedTray,
  cameraMode,
  tourStep,
  lightingMode,
  activeHotspot,
  onSelectRoom,
  onSelectTray,
  onSelectHotspot,
}: Farm3DSceneProps) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallax({ x: -nx * 8, y: -ny * 5 });
  };

  const getSpeciesMacroImage = (speciesName?: string | null) => {
    const s = (speciesName || "").toLowerCase();
    if (s.includes("linh chi")) return "/images/hero-chamber-warm-champagne.jpg";
    if (s.includes("đông trùng") || s.includes("hạ thảo")) return "/images/hero-chamber-light-latte.jpg";
    return "/images/hero-view-mushroom-macro.jpg";
  };

  const lightingOverlay =
    lightingMode === "uvc"
      ? "bg-purple-900/35 mix-blend-multiply"
      : lightingMode === "night"
      ? "bg-amber-950/40 mix-blend-multiply"
      : "bg-transparent";

  const activeScene = (() => {
    if (cameraMode === "tour") {
      if (tourStep === 0) {
        return {
          key: "tour-exterior",
          src: "/images/farm3d/exterior-facility.jpg",
          alt: "Ngoại thất khu MushroomCloud Agritech Center",
          scale: 1.04,
        };
      }
      if (tourStep === 1) {
        return {
          key: "tour-cutaway",
          src: "/images/farm3d/overview-cutaway.jpg",
          alt: "Mô hình cắt lớp Isometric 3 buồng nuôi",
          scale: 1.06,
        };
      }
      if (tourStep === 2) {
        return {
          key: "tour-aisle",
          src: "/images/hero-view-facility-multitier.jpg",
          alt: "Hành lang giàn kệ 5 tầng phòng sạch",
          scale: 1.08,
        };
      }
      return {
        key: "tour-macro",
        src: "/images/hero-view-mushroom-macro.jpg",
        alt: "Cận cảnh khay nấm & cảm biến IoT",
        scale: 1.05,
      };
    }

    if (cameraMode === "tray" && selectedTray) {
      return {
        key: `tray-${selectedTray.trayId}`,
        src: getSpeciesMacroImage(selectedTray.speciesName),
        alt: selectedTray.trayCode,
        scale: 1.04,
      };
    }

    if (cameraMode === "room") {
      return {
        key: `room-${selectedRoomId}`,
        src: "/images/hero-view-facility-multitier.jpg",
        alt: "Bên trong buồng nuôi phòng sạch",
        scale: 1.04,
      };
    }

    return {
      key: "overview-cutaway",
      src: "/images/farm3d/overview-cutaway.jpg",
      alt: "Mô hình kiến trúc cắt lớp 3 buồng nuôi MushroomCloud",
      scale: 1.03,
    };
  })();

  const activeRoomTrays = trays.filter((t) =>
    selectedRoomId ? t.roomId === selectedRoomId : true
  );

  // Chế độ Sơ Đồ 2D: hiển thị mặt bằng kiến trúc sạch đẹp
  if (cameraMode === "top2d") {
    return (
      <div className="w-full h-full rounded-3xl bg-[#F5EFE6] dark:bg-[#1E1B18] border border-[#DECFC0] dark:border-[#474039] p-5 overflow-y-auto shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {rooms.map((room) => {
            const roomTrays = trays.filter((t) => t.roomId === room.roomId);
            return (
              <div
                key={room.roomId}
                className="rounded-2xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-[#F2E8DC] dark:border-[#474039] pb-2">
                  <div>
                    <span className="font-mono text-xs font-black text-[#C28E58]">
                      {room.roomCode}
                    </span>
                    <h3 className="text-xs font-bold text-[#24170E] dark:text-white">
                      {room.roomName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectRoom(room.roomId)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] dark:bg-[#322D28] text-[11px] font-bold text-[#6B442C] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#474039] cursor-pointer"
                  >
                    Vào buồng →
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {roomTrays.map((t) => {
                    const owned = ownedTrayCodes.has(t.trayCode);
                    const selected = selectedTray?.trayId === t.trayId;
                    const cls = selected
                      ? "bg-[#24170E] text-[#E2BA78] border-[#E2BA78]"
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
                        onClick={() => onSelectTray(t)}
                        title={`${t.trayCode} (${t.status})`}
                        className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition hover:scale-105 cursor-pointer truncate ${cls}`}
                      >
                        {t.trayCode.slice(-3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className="w-full h-full relative rounded-3xl overflow-hidden border border-[#DECFC0] dark:border-[#474039] shadow-xl bg-[#EFE8DC] dark:bg-[#1A1613] select-none"
    >
      {/* Lớp ảnh kiến trúc 3D với chuyển cảnh mượt chuẩn Reel 1–3 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScene.key}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{
            opacity: 1,
            scale: activeScene.scale,
            x: parallax.x,
            y: parallax.y,
          }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={activeScene.src}
            alt={activeScene.alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Lớp lọc ánh sáng Ngày / Đêm / UV-C */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${lightingOverlay}`}
      />

      {/* Nhãn nổi từng buồng trên mô hình Cutaway (phong cách Dormer - Reel 1) */}
      {(cameraMode === "overview" || (cameraMode === "tour" && tourStep === 1)) &&
        rooms.slice(0, 3).map((room, idx) => {
          const pos = ROOM_PILL_POSITIONS[idx] || ROOM_PILL_POSITIONS[0];
          const isSelected = selectedRoomId === room.roomId;
          return (
            <button
              key={room.roomId}
              type="button"
              onClick={() => onSelectRoom(room.roomId)}
              style={{ left: pos.left, top: pos.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 z-20 ${
                isSelected
                  ? "bg-[#24170E]/95 text-white border-[#E2BA78]"
                  : "bg-white/90 text-[#24170E] border-[#DECFC0] hover:border-[#C28E58]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="text-left leading-tight">
                <span className="text-xs font-black block">{room.roomCode}</span>
                <span className="text-[10px] opacity-75 whitespace-nowrap">
                  {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay •{" "}
                  {room.tempMin ?? 22}–{room.tempMax ?? 25}°C
                </span>
              </div>
            </button>
          );
        })}

      {/* Dải chọn khay nhanh khi đang ở trong Buồng Nuôi */}
      {cameraMode === "room" && (
        <div className="absolute top-3 left-3 right-3 p-3 rounded-2xl bg-[#24170E]/82 backdrop-blur-md border border-white/15 text-white z-20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#E2BA78]">
              Chọn nhanh khay trong buồng ({activeRoomTrays.length} khay)
            </span>
            <span className="text-[11px] text-stone-300">
              Bấm vào mã khay để zoom cận cảnh
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {activeRoomTrays.map((t) => {
              const owned = ownedTrayCodes.has(t.trayCode);
              const cls = owned
                ? "bg-[#E2BA78] text-[#1E1B18] border-[#FFF5EA]"
                : t.status === "OCCUPIED"
                ? "bg-emerald-600/80 text-white border-emerald-400/50"
                : t.status === "MAINTENANCE"
                ? "bg-rose-600/80 text-white border-rose-400/50"
                : "bg-white/15 text-white border-white/25 hover:bg-white/25";
              return (
                <button
                  key={t.trayId}
                  type="button"
                  onClick={() => onSelectTray(t)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold shrink-0 transition cursor-pointer ${cls}`}
                >
                  {t.trayCode.replace("TRAY-", "")}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3 Điểm Hotspot 01–02–03 khi cận cảnh Khay (phong cách Reel 4 Offline) */}
      {(cameraMode === "tray" || (cameraMode === "tour" && tourStep === 3)) &&
        HOTSPOT_PINS.map((pin) => {
          const active = activeHotspot === pin.id;
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => onSelectHotspot(pin.id)}
              style={{ left: pin.left, top: pin.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 shadow-xl transition-all cursor-pointer ${
                active
                  ? "bg-[#24170E] text-[#E2BA78] border-[#E2BA78] scale-110"
                  : "bg-white/95 text-[#24170E] border-[#24170E] hover:scale-105"
              }`}
            >
              <span className="font-mono text-[11px] font-black">{pin.label}</span>
              <span className="text-[10px] font-bold hidden sm:inline">{pin.title}</span>
            </button>
          );
        })}
    </div>
  );
}
