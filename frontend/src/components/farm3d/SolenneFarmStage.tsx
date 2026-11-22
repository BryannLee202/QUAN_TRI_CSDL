'use client';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Farm3DRoom, Farm3DTray } from "./Farm3DScene";
import type { CheckoutItemConfig } from "@/components/checkout/CheckoutGatewayModal";

type StageLevel = "exterior" | "cutaway" | "interior" | "tray" | "trays2d";

interface SolenneFarmStageProps {
  rooms: Farm3DRoom[];
  trays: Farm3DTray[];
  ownedTrayCodes: Set<string>;
  initialTrayCode?: string | null;
  onOpenCheckout: (item: CheckoutItemConfig) => void;
}

const EXTERIOR_CALLOUTS = [
  { left: "54%", top: "48%", origin: "54% 48%" },
  { left: "62%", top: "58%", origin: "62% 58%" },
  { left: "71%", top: "66%", origin: "71% 66%" },
];

const CUTAWAY_PINS = [
  { left: "26%", top: "38%", origin: "26% 42%" },
  { left: "48%", top: "44%", origin: "50% 48%" },
  { left: "73%", top: "50%", origin: "74% 52%" },
];

const HOTSPOT_PINS = [
  {
    id: 1,
    code: "01",
    title: "Khối Phôi & Quả Thể Nấm",
    spec: "Giống hữu cơ chuẩn VietGAP",
    note: "Phôi nấm vô trùng được theo dõi tăng trưởng mỗi 12 giờ.",
    left: "43%",
    top: "56%",
  },
  {
    id: 2,
    code: "02",
    title: "Cảm Biến IoT LoRaWAN",
    spec: "23.6°C • 89.5% RH • 610 ppm CO₂",
    note: "Đồng bộ dữ liệu thời gian thực về bảng SensorData mỗi 5 giây.",
    left: "72%",
    top: "48%",
  },
  {
    id: 3,
    code: "03",
    title: "Đèn LED Quang Phổ 5000K",
    spec: "Điều chỉnh phổ ánh sáng theo chu kỳ",
    note: "Kích thích mũ nấm bung tán đồng đều, giữ độ ẩm chuẩn.",
    left: "52%",
    top: "20%",
  },
];

const RENTAL_PACKAGES = [
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

export default function SolenneFarmStage({
  rooms,
  trays,
  ownedTrayCodes,
  initialTrayCode,
  onOpenCheckout,
}: SolenneFarmStageProps) {
  const initialTray = useMemo(() => {
    if (!initialTrayCode) return null;
    return trays.find((t) => t.trayCode === initialTrayCode) || null;
  }, [trays, initialTrayCode]);

  const [level, setLevel] = useState<StageLevel>(initialTray ? "tray" : "exterior");
  const [selectedRoomId, setSelectedRoomId] = useState<number>(
    initialTray?.roomId || rooms[0]?.roomId || 1
  );
  const [selectedTray, setSelectedTray] = useState<Farm3DTray | null>(initialTray);
  const [zoomOrigin, setZoomOrigin] = useState<string>("50% 50%");
  const [activeHotspot, setActiveHotspot] = useState<number>(1);
  const [selectedPkgId, setSelectedPkgId] = useState<number>(1);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.roomId === selectedRoomId) || rooms[0] || null,
    [rooms, selectedRoomId]
  );

  const selectedRoomIndex = useMemo(() => {
    const idx = rooms.findIndex((r) => r.roomId === selectedRoomId);
    return idx >= 0 ? idx : 0;
  }, [rooms, selectedRoomId]);

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

  const getSpeciesMacroImage = (speciesName?: string | null) => {
    const s = (speciesName || "").toLowerCase();
    if (s.includes("linh chi")) return "/images/hero-chamber-warm-champagne.jpg";
    if (s.includes("đông trùng") || s.includes("hạ thảo")) {
      return "/images/hero-chamber-light-latte.jpg";
    }
    return "/images/hero-view-mushroom-macro.jpg";
  };

  const flyFromExteriorToCutaway = (roomId: number, origin: string) => {
    setSelectedRoomId(roomId);
    setZoomOrigin(origin);
    setLevel("cutaway");
  };

  const flyFromCutawayToInterior = (roomId?: number, origin?: string) => {
    if (roomId) setSelectedRoomId(roomId);
    if (origin) setZoomOrigin(origin);
    setLevel("interior");
  };

  const flyToTray = (tray: Farm3DTray) => {
    setSelectedTray(tray);
    setSelectedRoomId(tray.roomId);
    setZoomOrigin("50% 50%");
    setLevel("tray");
  };

  const activeImage = useMemo(() => {
    if (level === "exterior") {
      return {
        key: "stage-exterior",
        src: "/images/farm3d/exterior-facility.jpg",
        alt: "Ngoại thất khu MushroomCloud Agritech Center",
      };
    }
    if (level === "cutaway") {
      return {
        key: "stage-cutaway",
        src: "/images/farm3d/overview-cutaway.jpg",
        alt: "Mặt bằng cắt lớp 3D 3 buồng nuôi MushroomCloud",
      };
    }
    if (level === "interior") {
      return {
        key: `stage-interior-${selectedRoomId}`,
        src: "/images/hero-view-facility-multitier.jpg",
        alt: "Bên trong hành lang giàn kệ 5 tầng phòng sạch",
      };
    }
    return {
      key: `stage-tray-${selectedTray?.trayId || "default"}`,
      src: getSpeciesMacroImage(selectedTray?.speciesName),
      alt: selectedTray?.trayCode || "Cận cảnh khay nấm",
    };
  }, [level, selectedRoomId, selectedTray]);

  const isOwnedSelected = Boolean(
    selectedTray && ownedTrayCodes.has(selectedTray.trayCode)
  );

  return (
    <section className="relative w-full h-[calc(100vh-68px)] min-h-[620px] bg-[#140D08] overflow-hidden select-none">
      {/* Lớp ảnh kiến trúc toàn màn hình với hiệu ứng Camera Zoom khóa đúng tâm kính */}
      {level !== "trays2d" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.key}
            initial={{ opacity: 0, scale: 1.18 }}
            animate={{ opacity: 1, scale: 1.0 }}
            exit={{ opacity: 0, scale: 1.95 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: zoomOrigin }}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Lớp phủ tối nhẹ giữ tương phản chữ kiểu editorial THE SOLENNE */}
      {level !== "trays2d" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 pointer-events-none" />
      )}

      {/* Thanh trên tối giản kiểu THE SOLENNE */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-30 pointer-events-none">
        <div className="text-white drop-shadow">
          <span className="text-[10px] font-mono tracking-[0.26em] uppercase text-[#E2BA78] block">
            {level === "exterior"
              ? "01 • TOÀN CẢNH KHU FARM"
              : level === "cutaway"
              ? "02 • MẶT BẰNG CẮT LỚP"
              : level === "interior"
              ? `03 • HÀNH LANG ${selectedRoom?.roomCode || "RM01"}`
              : level === "tray"
              ? `04 • ${selectedTray?.trayCode || "KHAY NẤM"}`
              : `SƠ ĐỒ KHAY • ${selectedRoom?.roomCode || "RM01"}`}
          </span>
          <span className="text-sm sm:text-base font-black tracking-[0.18em] uppercase">
            MUSHROOMCLOUD
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {level === "exterior" && (
            <button
              type="button"
              onClick={() =>
                flyFromExteriorToCutaway(
                  selectedRoom?.roomId || 1,
                  EXTERIOR_CALLOUTS[selectedRoomIndex]?.origin || "54% 48%"
                )
              }
              className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold tracking-[0.14em] uppercase transition cursor-pointer"
            >
              Mở Mặt Bằng Cắt Lớp →
            </button>
          )}
        </div>
      </div>

      {/* CẤP 1: CÁC ĐIỂM GỌI TẦNG/BUỒNG PHÁT SÁNG TRÊN MẶT KÍNH TÒA NHÀ */}
      {level === "exterior" &&
        rooms.slice(0, 3).map((room, idx) => {
          const pos = EXTERIOR_CALLOUTS[idx] || EXTERIOR_CALLOUTS[0];
          const isActive = selectedRoomId === room.roomId;
          return (
            <button
              key={room.roomId}
              type="button"
              onClick={() => flyFromExteriorToCutaway(room.roomId, pos.origin)}
              style={{ left: pos.left, top: pos.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2.5 ${
                isActive
                  ? "bg-[#24170E]/90 text-white border-[#E2BA78]"
                  : "bg-black/65 text-white border-white/35 hover:border-[#E2BA78]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <div className="text-left leading-tight">
                <span className="font-mono text-[11px] font-black text-[#E2BA78] block">
                  {room.roomCode}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay • Vào buồng →
                </span>
              </div>
            </button>
          );
        })}

      {/* CẤP 2: MẶT BẰNG CẮT LỚP 3D + SIDEBAR KÍNH MỜ BÊN PHẢI (THE SOLENNE FLOOR PLAN) */}
      {level === "cutaway" && (
        <>
          {rooms.slice(0, 3).map((room, idx) => {
            const pos = CUTAWAY_PINS[idx] || CUTAWAY_PINS[0];
            const isActive = selectedRoomId === room.roomId;
            return (
              <button
                key={room.roomId}
                type="button"
                onClick={() => setSelectedRoomId(room.roomId)}
                style={{ left: pos.left, top: pos.top }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#24170E]/95 text-white border-[#E2BA78] scale-105"
                    : "bg-white/90 text-[#24170E] border-[#DECFC0]"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-black">{room.roomCode}</span>
                <span className="text-[10px] opacity-75">
                  {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay
                </span>
              </button>
            );
          })}

          {/* Sidebar kính mờ bên phải giống "FLOOR 19 • AVAILABLE" */}
          <div className="absolute top-20 right-6 bottom-8 w-80 max-w-[calc(100vw-3rem)] z-30 rounded-3xl bg-[#1A130E]/82 backdrop-blur-xl border border-white/15 text-white p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold">
                  {selectedRoom?.roomCode || "RM01"} • ĐANG VẬN HÀNH
                </span>
                <span className="text-[11px] font-mono text-stone-300">ISO CLASS 5</span>
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {selectedRoom?.roomName || "Buồng Nuôi Nấm Công Nghệ Cao"}
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  {selectedRoom?.occupiedTrays ?? 0}/{selectedRoom?.totalTrays ?? 0} khay đang nuôi •{" "}
                  {selectedRoom?.availableTrays ?? 0} khay trống sẵn sàng thuê
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2.5 border-y border-white/10">
                <div>
                  <span className="text-[10px] text-stone-400 block">Nhiệt độ</span>
                  <strong className="text-xs font-mono text-[#E2BA78]">
                    {selectedRoom?.tempMin ?? 22}–{selectedRoom?.tempMax ?? 25}°C
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Độ ẩm</span>
                  <strong className="text-xs font-mono text-emerald-300">
                    {selectedRoom?.humidityMin ?? 85}–{selectedRoom?.humidityMax ?? 95}%
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">CO₂ Max</span>
                  <strong className="text-xs font-mono">
                    &lt; {selectedRoom?.co2Max ?? 1000}
                  </strong>
                </div>
              </div>

              {/* Các nút bay vào bên trong phòng */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                  Khám phá bên trong buồng
                </span>
                <button
                  type="button"
                  onClick={() =>
                    flyFromCutawayToInterior(
                      selectedRoom?.roomId,
                      CUTAWAY_PINS[selectedRoomIndex]?.origin || "50% 48%"
                    )
                  }
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span>Hành Lang Giàn Kệ 5 Tầng</span>
                  <span className="text-[#E2BA78]">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const first = roomTrays[0] || trays[0];
                    if (first) flyToTray(first);
                    else setLevel("tray");
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                >
                  <span>Cận Cảnh Khay Nấm &amp; IoT</span>
                  <span className="text-[#E2BA78]">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLevel("trays2d")}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#C28E58] hover:bg-[#D4A16A] text-[#1E1B18] text-xs font-black flex items-center justify-between transition cursor-pointer"
                >
                  <span>Chọn Từng Khay Thật ({roomTrays.length})</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setZoomOrigin("50% 50%");
                setLevel("exterior");
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-bold tracking-wider uppercase transition cursor-pointer"
            >
              ← Quay Lại Tòa Nhà (Exterior)
            </button>
          </div>
        </>
      )}

      {/* CẤP 4: 3 ĐIỂM HOTSPOT TRÊN KHAY + PHIẾU THUÊ KHAY */}
      {level === "tray" && (
        <>
          {HOTSPOT_PINS.map((pin) => {
            const active = activeHotspot === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => setActiveHotspot(pin.id)}
                style={{ left: pin.left, top: pin.top }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 shadow-xl transition-all cursor-pointer ${
                  active
                    ? "bg-[#24170E] text-[#E2BA78] border-[#E2BA78] scale-110"
                    : "bg-white/95 text-[#24170E] border-[#24170E] hover:scale-105"
                }`}
              >
                <span className="font-mono text-xs font-black">{pin.code}</span>
                <span className="text-[11px] font-bold hidden sm:inline">{pin.title}</span>
              </button>
            );
          })}

          <div className="absolute top-20 right-6 w-80 max-w-[calc(100vw-3rem)] z-30 rounded-3xl bg-[#1A130E]/85 backdrop-blur-xl border border-white/15 text-white p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <span className="font-mono text-xs font-black text-[#E2BA78]">
                  {selectedTray?.trayCode || "KHAY MẪU"}
                </span>
                <p className="text-sm font-bold mt-0.5">
                  {selectedTray?.speciesName || "Khay Trống Sẵn Sàng"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLevel("trays2d")}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold cursor-pointer"
              >
                Đổi khay
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#E2BA78] uppercase">
                Hotspot {HOTSPOT_PINS[activeHotspot - 1].code}
              </span>
              <p className="text-xs font-bold">{HOTSPOT_PINS[activeHotspot - 1].title}</p>
              <p className="text-[11px] text-emerald-300">
                {HOTSPOT_PINS[activeHotspot - 1].spec}
              </p>
              <p className="text-[11px] text-stone-300">
                {HOTSPOT_PINS[activeHotspot - 1].note}
              </p>
            </div>

            {isOwnedSelected && selectedTray && (
              <Link
                href={`/khay-cua-toi?tray=${encodeURIComponent(selectedTray.trayCode)}`}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center block transition"
              >
                Mở Trang Khay Của Tôi →
              </Link>
            )}

            {selectedTray && selectedTray.status === "AVAILABLE" && (
              <div className="space-y-2.5 pt-1 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase text-stone-300 block">
                  Thuê trực tiếp khay này
                </span>
                <div className="space-y-1">
                  {RENTAL_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-[11px] transition cursor-pointer ${
                        selectedPkgId === pkg.id
                          ? "bg-white/15 border-[#E2BA78] font-bold"
                          : "border-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="truncate pr-2">{pkg.name}</span>
                      <span className="text-[#E2BA78] shrink-0">{formatVnd(pkg.price)}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenCheckout({
                      orderType: "FAAS_RENTAL",
                      packageId: selectedPkg.id,
                      itemName: `${selectedPkg.name} (${selectedTray.trayCode})`,
                      subtitle: `Định danh vật lý ${selectedTray.trayCode} • Chu kỳ ${selectedPkg.duration}`,
                      grossAmount: selectedPkg.price,
                      durationLabel: selectedPkg.duration,
                      yieldCommitment: selectedPkg.yieldText,
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-[#C28E58] hover:bg-[#D4A16A] text-[#1E1B18] font-black text-xs transition cursor-pointer"
                >
                  THUÊ ĐÚNG KHAY NÀY →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* CHẾ ĐỘ SƠ ĐỒ 2D CHỌN TỪNG KHAY THẬT */}
      {level === "trays2d" && (
        <div className="absolute inset-0 pt-20 pb-20 px-6 overflow-y-auto bg-[#F5EFE6] dark:bg-[#1E1B18] z-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const list = trays.filter((t) => t.roomId === room.roomId);
              return (
                <div
                  key={room.roomId}
                  className="rounded-2xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] p-4 space-y-3 shadow-sm"
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
                      onClick={() => flyFromCutawayToInterior(room.roomId)}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] dark:bg-[#322D28] text-[11px] font-bold text-[#6B442C] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#474039] cursor-pointer"
                    >
                      Vào hành lang →
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {list.map((t) => {
                      const owned = ownedTrayCodes.has(t.trayCode);
                      const cls = owned
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
                          onClick={() => flyToTray(t)}
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
      )}

      {/* THANH ĐIỀU HƯỚNG DƯỚI CÙNG CHUẨN THE SOLENNE (Trái: Back to Floor Plan | Phải: Chuyển góc bên trong) */}
      {(level === "interior" || level === "tray" || level === "trays2d") && (
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3 z-30 pointer-events-none">
          <button
            type="button"
            onClick={() => {
              setZoomOrigin(CUTAWAY_PINS[selectedRoomIndex]?.origin || "50% 48%");
              setLevel("cutaway");
            }}
            className="px-4 py-2.5 rounded-full bg-[#1A130E]/85 hover:bg-[#1A130E] backdrop-blur-md border border-white/25 text-white text-[11px] font-bold tracking-wider uppercase transition shadow-lg pointer-events-auto cursor-pointer"
          >
            ← Quay Lại Mặt Bằng Cắt Lớp
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#1A130E]/85 backdrop-blur-md border border-white/20 pointer-events-auto shadow-lg">
            {[
              { key: "interior", label: "HÀNH LANG KỆ 5 TẦNG" },
              { key: "tray", label: "CẬN CẢNH KHAY & IOT" },
              { key: "trays2d", label: "SƠ ĐỒ CHỌN KHAY" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  if (tab.key === "tray" && !selectedTray && trays.length > 0) {
                    setSelectedTray(roomTrays[0] || trays[0]);
                  }
                  setLevel(tab.key as StageLevel);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition cursor-pointer ${
                  level === tab.key
                    ? "bg-[#E2BA78] text-[#1E1B18]"
                    : "text-white/85 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
