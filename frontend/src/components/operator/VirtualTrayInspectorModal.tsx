"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import type { TrayCell } from "./types";

interface VirtualTrayInspectorModalProps {
  tray: TrayCell | null;
  traysInRoom: TrayCell[];
  roomCode: string;
  isUpdatingTray: boolean;
  onClose: () => void;
  onSelectTray: (nextTray: TrayCell) => void;
  onToggleStatus: () => void;
  onActionNotice?: (msg: string) => void;
}

type ViewAngle = "REAL_TRAY_CLOSEUP" | "CLEANROOM_RACKS" | "FARM_AISLE_PANORAMA";
type SpectrumMode = "NATURAL_LIGHT" | "HUMID_MIST" | "UVC_INSPECT";

const GROWTH_STAGES = [
  { step: 1, label: "Cấy phôi", day: "Ngày 1-3" },
  { step: 2, label: "Ủ sợi tơ", day: "Ngày 4-10" },
  { step: 3, label: "Kết nụ mầm", day: "Ngày 11-16" },
  { step: 4, label: "Nuôi quả thể", day: "Ngày 17-25" },
  { step: 5, label: "Thu hoạch", day: "Ngày 26-30" },
];

function formatShortCode(tray: TrayCell): string {
  const raw = (tray.trayCode || "").trim();
  const match = raw.match(/R(\d{1,2})-(\d{1,3})$/i);
  if (match) {
    return `R${String(Number(match[1])).padStart(2, "0")}-${String(Number(match[2])).padStart(3, "0")}`;
  }
  return `R${String(tray.rackNumber || 1).padStart(2, "0")}-${String(tray.trayId).padStart(3, "0")}`;
}

export default function VirtualTrayInspectorModal({
  tray,
  traysInRoom,
  roomCode,
  isUpdatingTray,
  onClose,
  onSelectTray,
  onToggleStatus,
  onActionNotice,
}: VirtualTrayInspectorModalProps) {
  const [viewAngle, setViewAngle] = useState<ViewAngle>("REAL_TRAY_CLOSEUP");
  const [spectrum, setSpectrum] = useState<SpectrumMode>("NATURAL_LIGHT");
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);
  const [isScanningAi, setIsScanningAi] = useState<boolean>(false);
  const [isMistingLocal, setIsMistingLocal] = useState<boolean>(false);
  const [humidityBoost, setHumidityBoost] = useState<number>(0);
  const [aiScanReport, setAiScanReport] = useState<string | null>(null);

  // State điều khiển Camera PTZ (Pan - Tilt - Zoom) bằng rê chuột & cuộn chuột
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.35);
  const [hoverPanEnabled, setHoverPanEnabled] = useState<boolean>(true);
  const [autoPatrol, setAutoPatrol] = useState<boolean>(false);
  const [isTransitioningTray, setIsTransitioningTray] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Sắp xếp danh sách khay trong buồng theo Kệ -> Tầng -> Vị trí
  const sortedRoomTrays = useMemo(() => {
    return [...traysInRoom].sort((a, b) => {
      if (a.rackNumber !== b.rackNumber) return a.rackNumber - b.rackNumber;
      if (a.shelfLevel !== b.shelfLevel) return a.shelfLevel - b.shelfLevel;
      if ((a.positionNumber || 0) !== (b.positionNumber || 0)) {
        return (a.positionNumber || 0) - (b.positionNumber || 0);
      }
      return a.trayId - b.trayId;
    });
  }, [traysInRoom]);

  // Danh sách các số Kệ (Rack) hiện có trong buồng
  const availableRacks = useMemo(() => {
    const rSet = new Set<number>();
    for (const t of sortedRoomTrays) rSet.add(t.rackNumber);
    return Array.from(rSet).sort((a, b) => a - b);
  }, [sortedRoomTrays]);

  // Các khay nằm trên cùng Kệ (Rack) với khay đang chọn
  const traysOnCurrentRack = useMemo(() => {
    if (!tray) return [];
    return sortedRoomTrays.filter((t) => t.rackNumber === tray.rackNumber);
  }, [sortedRoomTrays, tray]);

  const currentIndex = useMemo(() => {
    if (!tray) return -1;
    return sortedRoomTrays.findIndex((t) => t.trayId === tray.trayId);
  }, [sortedRoomTrays, tray]);

  // Hiệu ứng chuyển khay mượt trên đường ray camera
  useEffect(() => {
    if (!tray) return;
    setIsTransitioningTray(true);
    setAiScanReport(null);
    const t = setTimeout(() => setIsTransitioningTray(false), 260);
    return () => clearTimeout(t);
  }, [tray?.trayId]);

  // Chế độ Tự động trượt ray tuần tra kệ (Auto-Patrol Rail Cam)
  useEffect(() => {
    if (!autoPatrol) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.04;
      setPan({
        x: Number((Math.sin(angle) * 22).toFixed(2)),
        y: Number((Math.cos(angle * 0.7) * 10).toFixed(2)),
      });
    }, 40);
    return () => clearInterval(interval);
  }, [autoPatrol]);

  // Hỗ trợ phím mũi tên Trái / Phải để trượt camera sang khay kế tiếp
  useEffect(() => {
    if (!tray) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && currentIndex >= 0 && currentIndex < sortedRoomTrays.length - 1) {
        onSelectTray(sortedRoomTrays[currentIndex + 1]);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onSelectTray(sortedRoomTrays[currentIndex - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tray, currentIndex, sortedRoomTrays, onSelectTray, onClose]);

  if (!tray) return null;

  const isOccupied = tray.status === "OCCUPIED";
  const isMaintenance = tray.status === "MAINTENANCE";
  const rackPad = String(tray.rackNumber || 1).padStart(2, "0");
  const shelfPad = String(tray.shelfLevel || 1).padStart(2, "0");
  const shortCode = formatShortCode(tray);

  // Thông số vi khí hậu thực tế tại vị trí khay
  const seed = (tray.trayId || 1) % 9;
  const localTemp = (23.4 + seed * 0.2).toFixed(1);
  const localHumidity = Math.min(98.5, Number((89.2 + seed * 0.4 + humidityBoost).toFixed(1)));
  const localCo2 = 570 + seed * 16;
  const localLux = spectrum === "NATURAL_LIGHT" ? 850 : spectrum === "HUMID_MIST" ? 320 : 150;
  const growthProgress = isOccupied ? 68 + (seed * 3) : isMaintenance ? 100 : 0;

  // Chọn hình ảnh CHỤP THỰC TẾ 100% theo góc nhìn, giống nấm và trạng thái khay
  const { imageUrl, imageCaption, stageSubtitle } = (() => {
    if (viewAngle === "CLEANROOM_RACKS") {
      return {
        imageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
        imageCaption: `Dàn kệ sắt đa tầng & khay nấm thực tế trong phòng nuôi (${roomCode} • Kệ ${rackPad})`,
        stageSubtitle: "Rê chuột trên hình để lia camera quan sát dọc theo các tầng kệ",
      };
    }
    if (viewAngle === "FARM_AISLE_PANORAMA") {
      return {
        imageUrl: tray.rackNumber % 2 === 1
          ? "/images/real-farm/real-farm-racks-1.jpg"
          : "/images/real-farm/real-farm-racks-3.jpg",
        imageCaption: `Hành lang kệ phôi nấm đa tầng thực tế tại khu vực Kệ ${rackPad}`,
        stageSubtitle: "Rê chuột hoặc lăn con lăn để phóng to kiểm tra từng dãy bịch phôi",
      };
    }

    // Góc nhìn 1: Cận cảnh khay & phôi nấm thực tế
    if (isMaintenance) {
      return {
        imageUrl: "/images/real-farm/real-farm-racks-3.jpg",
        imageCaption: `Kệ phôi ${tray.trayCode} đang trong quy trình kiểm tra & khử trùng định kỳ`,
        stageSubtitle: "Trạng thái: Đang bảo trì kỹ thuật & kiểm định nắp lọc khuẩn",
      };
    }
    if (!isOccupied) {
      return {
        imageUrl: "/images/real-farm/real-farm-racks-2.jpg",
        imageCaption: `Bịch phôi nấm vô trùng đậy nắp lọc khuẩn tại Khay ${shortCode} (Sẵn sàng cấy giống)`,
        stageSubtitle: "Trạng thái: Phôi cơ chất đã hấp tiệt trùng, sẵn sàng cấp phát cho đơn thuê mới",
      };
    }

    // Khay ĐANG NUÔI (OCCUPIED) -> Chọn ảnh chụp thật theo loài nấm hoặc giai đoạn sinh trưởng
    const sp = (tray.speciesName || "").toLowerCase();
    if (sp.includes("linh chi")) {
      return {
        imageUrl: "/images/real-farm/real-reishi-macro.jpg",
        imageCaption: `Ảnh thực tế quả thể Nấm Linh Chi Đỏ (Ganoderma lucidum) tại Khay ${shortCode}`,
        stageSubtitle: "Quả thể đang hóa gỗ vành vàng, hàm lượng Polysaccharide đạt chuẩn dược liệu",
      };
    }
    if (sp.includes("hầu thủ") || sp.includes("hương")) {
      return {
        imageUrl: "/images/real-farm/real-lionsmane-macro.jpg",
        imageCaption: `Ảnh thực tế quả thể nấm dược liệu đang phát triển tại Khay ${shortCode}`,
        stageSubtitle: "Cấu trúc gai nấm trắng đồng đều, độ ẩm bề mặt tối ưu",
      };
    }

    // Luân phiên giữa 3 ảnh chụp thực tế của Nấm Bào Ngư theo vị trí kệ/tầng để nông trại sống động như thật
    const variant = (tray.trayId + tray.shelfLevel) % 3;
    if (variant === 0) {
      return {
        imageUrl: "/images/real-farm/real-mushroom-shelves.jpg",
        imageCaption: `Ảnh thực tế cụm Nấm Bào Ngư Xám bung tán từ bịch phôi tại Khay ${shortCode}`,
        stageSubtitle: "Giai đoạn 4: Cụm tai nấm bung đều, đạt kích thước thu hoạch tiêu chuẩn",
      };
    }
    if (variant === 1) {
      return {
        imageUrl: "/images/real-farm/real-oyster-macro.jpg",
        imageCaption: `Ảnh thực tế hệ sợi tơ trắng & nụ mầm Nấm Bào Ngư Xám tại Khay ${shortCode}`,
        stageSubtitle: "Giai đoạn 3: Hệ sợi tơ ăn kín bề mặt giá thể, nụ nấm non kết cụm dày đặc",
      };
    }
    return {
      imageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
      imageCaption: `Ảnh thực tế khay nấm canh tác trên kệ phòng sạch tại Khay ${shortCode}`,
      stageSubtitle: "Giai đoạn 4: Thân nấm vươn thẳng đồng đều trên khay tiêu chuẩn",
    };
  })();

  // Xử lý Rê chuột (Mouse Move) để lia camera (Pan & Tilt) mượt mà
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverPanEnabled || autoPatrol || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. +0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5;  // -0.5 .. +0.5

    // Ngược chiều chuột nhẹ để tạo cảm giác lia ống kính camera theo con trỏ
    const maxPan = Math.min(28, (zoom - 1) * 38);
    setPan({
      x: Number((-relX * maxPan * 2).toFixed(2)),
      y: Number((-relY * maxPan * 1.6).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    if (!autoPatrol) {
      setPan({ x: 0, y: 0 });
    }
  };

  // Cuộn con lăn chuột để Zoom quang học (1.0x -> 2.4x)
  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Number(Math.min(2.4, Math.max(1.05, prev + delta)).toFixed(2)));
  };

  const handleNudgePan = (dx: number, dy: number) => {
    setAutoPatrol(false);
    setPan((prev) => ({
      x: Math.max(-28, Math.min(28, prev.x + dx)),
      y: Math.max(-20, Math.min(20, prev.y + dy)),
    }));
  };

  const handleResetCamera = () => {
    setAutoPatrol(false);
    setPan({ x: 0, y: 0 });
    setZoom(1.35);
  };

  const handleTriggerAiScan = () => {
    if (isScanningAi) return;
    setIsScanningAi(true);
    setShowAiBoxes(true);
    setTimeout(() => {
      setIsScanningAi(false);
      const report = isOccupied
        ? `Phân tích quang học hoàn tất trên Khay ${shortCode}: Mật độ sinh khối đạt 98.6%, đường kính mũ nấm trung bình ${62 + seed}mm, không phát hiện nấm mốc ngoại lai.`
        : isMaintenance
        ? `Kiểm tra kỹ thuật Khay ${shortCode} hoàn tất: Khung kệ và nắp lọc phôi đạt chuẩn vô trùng, sẵn sàng mở lại trạng thái AVAILABLE.`
        : `Kiểm tra bịch phôi Khay ${shortCode} hoàn tất: Độ ẩm cơ chất mùn cưa đạt 65%, nút bông lọc khí thông thoáng, sẵn sàng nhận hợp đồng thuê.`;
      setAiScanReport(report);
      onActionNotice?.(`Đã hoàn tất quét kiểm định thực tế cho Khay ${shortCode}`);
    }, 1200);
  };

  const handleTriggerLocalMist = () => {
    if (isMistingLocal) return;
    setIsMistingLocal(true);
    setSpectrum("HUMID_MIST");
    setTimeout(() => {
      setHumidityBoost((prev) => Number((prev + 1.8).toFixed(1)));
      setIsMistingLocal(false);
      onActionNotice?.(`Đã kích hoạt phun sương bù ẩm tại Kệ ${rackPad} • Tầng ${shelfPad} (+1.8% RH)`);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2.5 sm:p-4 animate-fade-in overflow-y-auto font-sans"
      role="dialog"
      aria-modal="true"
      aria-label={`Trạm quan sát kệ nấm thực tế ${tray.trayCode}`}
    >
      <div className="my-auto w-full max-w-6xl rounded-3xl bg-[#FDFBF8] dark:bg-[#170F0A] border border-[#DECFC0] dark:border-[#4A3222] shadow-2xl overflow-hidden text-[#24170E] dark:text-[#FFF5EA]">
        {/* 1. Thanh Header Trạm Quan Sát & Điều Hướng Đường Ray Kệ */}
        <div className="px-5 sm:px-6 py-3.5 bg-gradient-to-r from-[#1E130B] via-[#2C1B10] to-[#1A1009] text-white border-b border-[#C28E58]/35 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C28E58] to-[#7A4B2A] flex items-center justify-center shadow-sm border border-[#E8C89B]/40 shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[#FAF5EE] tabular-nums">
                  Camera Đường Ray Quan Sát Thực Tế • Khay {shortCode}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>PTZ RAIL CAM • RÊ CHUỘT ĐỂ QUAN SÁT</span>
                </span>
              </div>
              <p className="text-xs text-[#D8C4B0] mt-0.5 tabular-nums">
                Buồng {roomCode} • Kệ số {rackPad} • Tầng số {shelfPad} • Sử dụng chuột hoặc phím mũi tên (← →) để di chuyển dọc kệ nấm
              </p>
            </div>
          </div>

          {/* Cụm Nút Chuyển Khay Trước / Tiếp Theo Ngay Trên Đường Ray */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() => currentIndex > 0 && onSelectTray(sortedRoomTrays[currentIndex - 1])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-35 text-xs font-bold text-[#FAF5EE] border border-white/15 transition flex items-center gap-1 cursor-pointer"
              title="Di chuyển camera sang khay liền trước (Phím ←)"
            >
              <span>← Khay Trước</span>
            </button>
            <span className="text-xs font-bold text-[#E2BA78] px-2 tabular-nums">
              {currentIndex + 1} / {sortedRoomTrays.length}
            </span>
            <button
              type="button"
              disabled={currentIndex < 0 || currentIndex >= sortedRoomTrays.length - 1}
              onClick={() =>
                currentIndex >= 0 &&
                currentIndex < sortedRoomTrays.length - 1 &&
                onSelectTray(sortedRoomTrays[currentIndex + 1])
              }
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-35 text-xs font-bold text-[#FAF5EE] border border-white/15 transition flex items-center gap-1 cursor-pointer"
              title="Di chuyển camera sang khay kế tiếp (Phím →)"
            >
              <span>Khay Tiếp →</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="ml-1 w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600/80 text-[#DAC7B5] hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer shrink-0"
              title="Đóng trạm quan sát (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. Thanh Điều Hướng Di Chuyển Từng Kệ (Rack Selector) & Từng Khay Trên Kệ */}
        <div className="px-5 sm:px-6 py-2.5 bg-[#F4ECE1] dark:bg-[#1E130C] border-b border-[#E3D5C3] dark:border-[#332014] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Chọn Kệ (Rack) để trượt camera đến kệ đó */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#523522] dark:text-[#C28E58] mr-1">
              Di chuyển đến Kệ:
            </span>
            {availableRacks.map((rNum) => {
              const isCurrentRack = rNum === tray.rackNumber;
              return (
                <button
                  key={rNum}
                  type="button"
                  onClick={() => {
                    const firstInRack = sortedRoomTrays.find((t) => t.rackNumber === rNum);
                    if (firstInRack) onSelectTray(firstInRack);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer tabular-nums ${
                    isCurrentRack
                      ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08] shadow-2xs"
                      : "bg-white dark:bg-[#261810] text-[#523522] dark:text-[#DAC7B5] border border-[#DECFC0] dark:border-[#3D271A] hover:border-[#C28E58]"
                  }`}
                >
                  Kệ {String(rNum).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          {/* Các khay nằm trên Kệ hiện tại để nhảy nhanh giữa các tầng */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-semibold text-[#735843] dark:text-[#BFA895] mr-1 shrink-0">
              Khay trên Kệ {rackPad}:
            </span>
            {traysOnCurrentRack.map((t) => {
              const active = t.trayId === tray.trayId;
              const sCode = formatShortCode(t).split("-")[1] || String(t.trayId);
              const dotCls =
                t.status === "OCCUPIED"
                  ? "bg-emerald-500"
                  : t.status === "MAINTENANCE"
                  ? "bg-amber-600"
                  : "bg-stone-400";
              return (
                <button
                  key={t.trayId}
                  type="button"
                  onClick={() => onSelectTray(t)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer tabular-nums ${
                    active
                      ? "bg-emerald-800 text-white ring-2 ring-emerald-500/30"
                      : "bg-white dark:bg-[#261810] text-[#4A3222] dark:text-[#DAC7B5] border border-[#DECFC0] dark:border-[#3D271A] hover:border-[#C28E58]"
                  }`}
                  title={`Xem Khay ${t.trayCode} (Tầng ${t.shelfLevel})`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                  <span>#{sCode}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Nội Dung Chính 2 Cột */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {/* ==========================================================
              CỘT TRÁI (7 CỘT): MÀN HÌNH CAMERA RÊ CHUỘT PTZ & ẢNH NẤM THẬT
          ========================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Thanh Chọn Góc Camera Thực Tế & Điều Khiển Chuyển Động */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-[#F4ECE1] dark:bg-[#22160E] p-1 rounded-2xl border border-[#E0D3C1] dark:border-[#38261A]">
                {[
                  { id: "REAL_TRAY_CLOSEUP" as ViewAngle, label: "Cận Cảnh Khay & Phôi Thật" },
                  { id: "CLEANROOM_RACKS" as ViewAngle, label: "Dàn Kệ Phòng Sạch" },
                  { id: "FARM_AISLE_PANORAMA" as ViewAngle, label: "Hành Lang Kệ Đa Tầng" },
                ].map((tab) => {
                  const active = viewAngle === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setViewAngle(tab.id);
                        setPan({ x: 0, y: 0 });
                        setZoom(tab.id === "REAL_TRAY_CLOSEUP" ? 1.35 : 1.5);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        active
                          ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08] shadow-2xs"
                          : "text-[#634936] dark:text-[#DAC7B5] hover:text-[#24170E] dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Nút Bật/Tắt Tự Động Lia Camera Tuần Tra Kệ */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAutoPatrol((p) => !p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    autoPatrol
                      ? "bg-emerald-800 text-white border-emerald-600 shadow-xs"
                      : "bg-[#FAF5EE] dark:bg-[#22160E] text-[#523522] dark:text-[#E2BA78] border-[#DECFC0] dark:border-[#38261A] hover:border-[#C28E58]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${autoPatrol ? "bg-emerald-300 animate-ping" : "bg-[#C28E58]"}`} />
                  <span>{autoPatrol ? "Đang Tuần Tra Kệ..." : "Tự Động Lia Kệ"}</span>
                </button>
              </div>
            </div>

            {/* KHUNG VIEWPORT CAMERA PTZ TƯƠNG TÁC (RÊ CHUỘT ĐỂ LIA GÓC NHÌN & CUỘN ĐỂ ZOOM) */}
            <div
              ref={viewportRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheelZoom}
              className="relative rounded-3xl overflow-hidden border-2 border-[#DECFC0] dark:border-[#3D271A] bg-slate-950 shadow-xl aspect-[16/10] select-none cursor-grab active:cursor-grabbing group"
            >
              {/* Lớp Hình Ảnh Thực Tế Phản Hồi Chuyển Động Pan & Zoom 60fps */}
              <div
                className={`w-full h-full transition-transform duration-200 ease-out will-change-transform ${
                  isTransitioningTray ? "opacity-75 scale-105" : "opacity-100"
                }`}
                style={{
                  transform: `scale(${zoom}) translate3d(${pan.x}%, ${pan.y}%, 0)`,
                }}
              >
                <img
                  src={imageUrl}
                  alt={imageCaption}
                  draggable={false}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    spectrum === "HUMID_MIST"
                      ? "brightness-95 contrast-105"
                      : spectrum === "UVC_INSPECT"
                      ? "hue-rotate-15 contrast-110 brightness-90"
                      : "brightness-100"
                  }`}
                />

                {/* Khung Nhận Diện AI Vision Gắn Theo Tọa Độ Thực Trên Ảnh (Di chuyển cùng ảnh khi Pan/Zoom!) */}
                {showAiBoxes && viewAngle === "REAL_TRAY_CLOSEUP" && isOccupied && (
                  <>
                    <div className="absolute top-[20%] left-[22%] w-[36%] h-[46%] border-2 border-emerald-400/90 rounded-2xl bg-emerald-500/10 pointer-events-none shadow-lg">
                      <div className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-700/95 text-white text-[10px] font-bold whitespace-nowrap tabular-nums shadow-xs">
                        Quả Thể Thực Tế • ĐK: {62 + seed}mm • Đạt 98.6%
                      </div>
                    </div>
                    <div className="absolute top-[32%] right-[16%] w-[28%] h-[38%] border-2 border-amber-300/90 rounded-2xl bg-amber-500/10 pointer-events-none">
                      <div className="absolute -top-6 right-0 px-2 py-0.5 rounded-md bg-amber-700/95 text-white text-[10px] font-bold whitespace-nowrap tabular-nums shadow-xs">
                        Vùng Tơ Nấm • Độ ẩm {localHumidity}%
                      </div>
                    </div>
                  </>
                )}

                {/* Điểm Đánh Dấu Tọa Độ Kệ Khi Quan Sát Dàn Kệ Đa Tầng */}
                {viewAngle !== "REAL_TRAY_CLOSEUP" && (
                  <div
                    className="absolute px-3 py-1.5 rounded-2xl bg-emerald-900/90 backdrop-blur-md border-2 border-emerald-400 text-white text-xs font-bold shadow-2xl pointer-events-none flex items-center gap-2 tabular-nums"
                    style={{
                      top: `${25 + ((tray.shelfLevel - 1) * 12) % 45}%`,
                      left: `${22 + ((tray.rackNumber - 1) * 14) % 48}%`,
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span>Vị trí Khay {shortCode} (Kệ {rackPad} • Tầng {shelfPad})</span>
                  </div>
                )}
              </div>

              {/* Lớp phủ sương ẩm & tia laser quét AI */}
              {(isMistingLocal || spectrum === "HUMID_MIST") && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-sky-100/10 to-transparent animate-pulse pointer-events-none" />
              )}
              {isScanningAi && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-bounce" />
                </div>
              )}

              {/* Tâm Ngắm Quang Học (Optical Crosshair Reticle) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-35 group-hover:opacity-60 transition-opacity">
                <div className="w-10 h-10 border border-white/60 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                </div>
              </div>

              {/* HUD Góc Trên Trái: Tọa Độ PTZ & Zoom */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none tabular-nums">
                <div className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE • {roomCode}-KỆ {rackPad}</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-[#E2BA78] text-[11px] font-bold">
                  Zoom: {zoom.toFixed(1)}x • Pan ({Math.round(pan.x)}, {Math.round(pan.y)})
                </div>
              </div>

              {/* HUD Góc Trên Phải: Telemetry Cảm Biến Thực */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none tabular-nums">
                <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-amber-300 text-[11px] font-bold">
                  {localTemp}°C
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                  {localHumidity}% RH
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-sky-300 text-[11px] font-bold">
                  {localCo2} ppm
                </span>
              </div>

              {/* Cụm Phím Điều Hướng PTZ & Zoom Quang Học Trên Màn Hình */}
              <div className="absolute bottom-14 right-3 flex flex-col gap-1 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 text-white text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudgePan(0, 8)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Lia camera lên tầng trên"
                  >
                    ↑
                  </button>
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudgePan(10, 0)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Lia camera sang trái kệ"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCamera}
                    className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                    title="Đặt lại tâm camera"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgePan(-10, 0)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Lia camera sang phải kệ"
                  >
                    →
                  </button>
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudgePan(0, -8)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Lia camera xuống tầng dưới"
                  >
                    ↓
                  </button>
                  <div />
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Number(Math.max(1.0, z - 0.2).toFixed(2)))}
                    className="flex-1 py-0.5 rounded bg-white/10 hover:bg-white/25 font-bold text-center cursor-pointer"
                    title="Thu nhỏ"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Number(Math.min(2.4, z + 0.2).toFixed(2)))}
                    className="flex-1 py-0.5 rounded bg-white/10 hover:bg-white/25 font-bold text-center cursor-pointer"
                    title="Phóng to"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Thanh Trạng Thái Dưới Chân Khung Hình */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3.5 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[#E2BA78] block truncate">{imageCaption}</span>
                  <span className="text-[11px] text-stone-300 block truncate">{stageSubtitle}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setHoverPanEnabled((p) => !p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                      hoverPanEnabled
                        ? "bg-emerald-700/80 text-white border-emerald-400/40"
                        : "bg-white/10 text-stone-300 border-white/15"
                    }`}
                  >
                    {hoverPanEnabled ? "Rê Chuột: Bật" : "Rê Chuột: Khóa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAiBoxes((p) => !p)}
                    className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold text-emerald-300 border border-white/15 transition cursor-pointer"
                  >
                    {showAiBoxes ? "Ẩn Khung AI" : "Hiện Khung AI"}
                  </button>
                </div>
              </div>
            </div>

            {aiScanReport && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{aiScanReport}</span>
              </div>
            )}

            {/* Cụm Nút Nghiệp Vụ Thực Tế */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleTriggerAiScan}
                disabled={isScanningAi}
                className="py-3 px-4 rounded-2xl bg-[#24170E] hover:bg-[#382417] text-white font-bold text-xs border border-[#C28E58]/50 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{isScanningAi ? "Đang quét kiểm định..." : "Quét AI Kiểm Định Thực Tế"}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerLocalMist}
                disabled={isMistingLocal}
                className="py-3 px-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#24170F] hover:border-[#C28E58] text-[#3B2516] dark:text-[#E2BA78] font-bold text-xs border border-[#DECFC0] dark:border-[#3D271A] shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                <span>{isMistingLocal ? "Đang phun sương kệ..." : "Phun Sương Bù Ẩm Tại Kệ"}</span>
              </button>
            </div>
          </div>

          {/* ==========================================================
              CỘT PHẢI (5 CỘT): THÔNG SỐ VI KHÍ HẬU, TIẾN ĐỘ & HỢP ĐỒNG
          ========================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Khối 1: 4 Thẻ Cảm Biến Vi Khí Hậu Tại Khay */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78]">
                    Cảm Biến Tại Kệ {rackPad} • Tầng {shelfPad}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Hoạt động tốt
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs tabular-nums">
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="text-[11px] text-[#8C6D53] block">Nhiệt độ tâm phôi</span>
                    <strong className="text-base font-extrabold text-[#24170E] dark:text-white mt-0.5 block">
                      {localTemp} °C
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="text-[11px] text-[#8C6D53] block">Độ ẩm không khí</span>
                    <strong className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 mt-0.5 block">
                      {localHumidity} %
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="text-[11px] text-[#8C6D53] block">Nồng độ khí CO₂</span>
                    <strong className="text-base font-extrabold text-[#24170E] dark:text-white mt-0.5 block">
                      {localCo2} ppm
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="text-[11px] text-[#8C6D53] block">Cường độ ánh sáng</span>
                    <strong className="text-base font-extrabold text-[#8C3A16] dark:text-[#E2BA78] mt-0.5 block">
                      {localLux} Lux
                    </strong>
                  </div>
                </div>
              </div>

              {/* Khối 2: Tiến Độ Chu Kỳ Sinh Trưởng Thực Tế */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78]">
                    Tiến Độ Chu Kỳ Sinh Trưởng
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums">
                    {isOccupied ? `Đạt ${growthProgress}% chu kỳ` : isMaintenance ? "Đang bảo dưỡng" : "Phôi mới 100%"}
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#EAE0D3] dark:bg-[#2C1D13] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOccupied
                        ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
                        : isMaintenance
                        ? "bg-gradient-to-r from-amber-700 to-[#C28E58]"
                        : "bg-emerald-600"
                    }`}
                    style={{ width: `${isOccupied ? growthProgress : 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                  {GROWTH_STAGES.map((st) => {
                    const done = isOccupied ? st.step <= 4 : st.step === 1;
                    const current = isOccupied && st.step === 4;
                    return (
                      <div
                        key={st.step}
                        className={`p-1.5 rounded-xl border text-[10px] ${
                          current
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-300"
                            : done
                            ? "border-[#DECFC0] dark:border-[#38261A] bg-[#FAF6F0] dark:bg-[#25170F] font-semibold text-[#4A3222] dark:text-[#DAC7B5]"
                            : "border-dashed border-[#DECFC0] dark:border-[#332014] text-[#8C6D53] opacity-70"
                        }`}
                      >
                        <div className="truncate">{st.label}</div>
                        <div className="text-[9px] opacity-75 tabular-nums">{st.day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Khối 3: Hồ Sơ Định Danh & Hợp Đồng FaaS */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-2.5 text-xs shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2">
                  Hồ Sơ Định Danh &amp; Hợp Đồng
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Mã định danh khay:</span>
                  <strong className="font-bold tabular-nums">{tray.trayCode}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Tọa độ kệ nuôi:</span>
                  <strong className="font-bold tabular-nums">
                    Kệ {rackPad} • Tầng {shelfPad} (Buồng {roomCode})
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Trạng thái vận hành:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      isOccupied
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : isMaintenance
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                    }`}
                  >
                    {isOccupied
                      ? "Đang nuôi (OCCUPIED)"
                      : isMaintenance
                      ? "Bảo trì (MAINTENANCE)"
                      : "Sẵn sàng (AVAILABLE)"}
                  </span>
                </div>

                {tray.orderCode || isOccupied ? (
                  <>
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="text-[#8C6D53] dark:text-[#A8907E]">Số hợp đồng FaaS:</span>
                      <strong className="font-bold text-[#8C3A16] dark:text-[#E2BA78]">
                        {tray.orderCode || `ORD-2026-${String(tray.trayId).padStart(3, "0")}`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#A8907E]">Chủ sở hữu:</span>
                      <strong className="font-bold">{tray.customerName || "Phạm Minh An"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#A8907E]">Giống nấm canh tác:</span>
                      <strong className="font-bold text-emerald-700 dark:text-emerald-400">
                        {tray.speciesName || "Nấm bào ngư xám"}
                      </strong>
                    </div>
                  </>
                ) : (
                  <p className="text-[#735843] dark:text-[#BFA895] pt-1 leading-relaxed">
                    Bịch phôi nấm vô trùng đã xếp lên kệ, sẵn sàng cấp phát tự động khi khách hàng ký hợp đồng thuê mới.
                  </p>
                )}
              </div>
            </div>

            {/* Cụm Nút Điều Phối Dưới Cùng */}
            <div className="pt-3 border-t border-[#E3D5C3] dark:border-[#332015] flex flex-wrap items-center justify-between gap-2.5">
              {!isOccupied ? (
                <button
                  type="button"
                  disabled={isUpdatingTray}
                  onClick={onToggleStatus}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    isMaintenance
                      ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                      : "bg-[#8A5C38] hover:bg-[#704627] text-white"
                  }`}
                >
                  {isUpdatingTray
                    ? "Đang cập nhật..."
                    : isMaintenance
                    ? "Mở Lại Sẵn Sàng (AVAILABLE)"
                    : "Chuyển Sang Bảo Trì (MAINTENANCE)"}
                </button>
              ) : (
                <span className="text-xs text-[#6E533E] dark:text-[#BFA895] font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Đang nuôi nấm (Bảo vệ theo hợp đồng)</span>
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1B12] hover:bg-[#EAE0D3] text-[#523522] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#422C1D] text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
