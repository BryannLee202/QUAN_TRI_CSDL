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
  onTriggerHardwareMist?: () => Promise<void> | void;
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

/**
 * Khóa biên tọa độ đường ray tuyệt đối trong khoảng [0, 100]%
 * Đảm bảo lớp ảnh panorama luôn phủ kín 100% khung nhìn, 0% lộ viền đen.
 */
function clampPct(val: number): number {
  return Number(Math.max(0, Math.min(100, val)).toFixed(2));
}

export default function VirtualTrayInspectorModal({
  tray,
  traysInRoom,
  roomCode,
  isUpdatingTray,
  onClose,
  onSelectTray,
  onToggleStatus,
  onTriggerHardwareMist,
  onActionNotice,
}: VirtualTrayInspectorModalProps) {
  const [viewAngle, setViewAngle] = useState<ViewAngle>("REAL_TRAY_CLOSEUP");
  const [spectrum, setSpectrum] = useState<SpectrumMode>("NATURAL_LIGHT");
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);
  const [isScanningAi, setIsScanningAi] = useState<boolean>(false);
  const [isMistingLocal, setIsMistingLocal] = useState<boolean>(false);
  const [humidityBoost, setHumidityBoost] = useState<number>(0);
  const [aiScanReport, setAiScanReport] = useState<string | null>(null);

  /**
   * railPos.x: Vị trí ngang của camera dọc theo thanh ray kệ (0% = Khoang Đầu Kệ, 50% = Khoang Giữa Kệ, 100% = Khoang Cuối Kệ)
   * railPos.y: Vị trí dọc của camera theo tầng kệ (0% = Tầng trên, 100% = Tầng dưới)
   */
  const [railPos, setRailPos] = useState<{ x: number; y: number }>({ x: 15, y: 45 });
  const [zoom, setZoom] = useState<number>(1.15);
  const [hoverPanEnabled, setHoverPanEnabled] = useState<boolean>(true);
  const [autoPatrol, setAutoPatrol] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPointerTracking, setIsPointerTracking] = useState<boolean>(false);
  const [isTransitioningTray, setIsTransitioningTray] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const radarTrackRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);

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

  const currentRackTrayIndex = useMemo(() => {
    if (!tray) return 0;
    const idx = traysOnCurrentRack.findIndex((t) => t.trayId === tray.trayId);
    return idx >= 0 ? idx : 0;
  }, [traysOnCurrentRack, tray]);

  // Khi chuyển sang khay khác, tự động trượt mượt camera dọc thanh ray đến đúng tọa độ của khay đó trên kệ
  useEffect(() => {
    if (!tray) return;
    setIsPointerTracking(false);
    setIsTransitioningTray(true);
    setAiScanReport(null);

    const totalInRack = traysOnCurrentRack.length;
    const targetX =
      totalInRack > 1
        ? clampPct((currentRackTrayIndex / (totalInRack - 1)) * 100)
        : 50;
    const targetY = clampPct(((tray.shelfLevel - 1) / 4) * 85 + 10);

    setRailPos({ x: targetX, y: targetY });

    const t = setTimeout(() => setIsTransitioningTray(false), 260);
    return () => clearTimeout(t);
  }, [tray?.trayId, currentRackTrayIndex, traysOnCurrentRack.length]);

  // Chế độ Tự động trượt ray tuần tra từ đầu kệ (0%) qua giữa kệ (50%) tới cuối kệ (100%)
  useEffect(() => {
    if (!autoPatrol) return;
    setIsPointerTracking(true);
    let phase = (railPos.x / 100) * Math.PI;
    const interval = setInterval(() => {
      phase += 0.022;
      setRailPos({
        x: clampPct(((Math.sin(phase) + 1) / 2) * 100),
        y: clampPct(50 + Math.cos(phase * 0.7) * 35),
      });
    }, 32);
    return () => clearInterval(interval);
  }, [autoPatrol]);

  // Đăng ký Native Non-Passive Wheel Listener trên Viewport để chặn cuộn trang nền khi lăn chuột Zoom/Pan
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const step = (e.deltaX || e.deltaY) > 0 ? 7 : -7;
        setAutoPatrol(false);
        setIsPointerTracking(false);
        setRailPos((prev) => ({ ...prev, x: clampPct(prev.x + step) }));
        return;
      }

      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((prev) => Number(Math.min(2.4, Math.max(1.0, prev + delta)).toFixed(2)));
    };

    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [tray?.trayId]);

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
  const growthProgress = isOccupied ? 68 + seed * 3 : isMaintenance ? 100 : 0;

  // Chọn bộ 3 hình ảnh thực tế cho 3 Khoang Kệ Liên Tiếp (Khoang Đầu 0-33% • Khoang Giữa 33-66% • Khoang Cuối 66-100%)
  const { bay1ImageUrl, bay2ImageUrl, bay3ImageUrl, imageCaption, stageSubtitle } = (() => {
    if (viewAngle === "CLEANROOM_RACKS") {
      return {
        bay1ImageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
        bay2ImageUrl: "/images/real-farm/real-mushroom-shelves.jpg",
        bay3ImageUrl: "/images/real-farm/real-farm-racks-2.jpg",
        imageCaption: `Dàn kệ sắt đa tầng & khay nấm thực tế trong phòng nuôi (${roomCode} • Kệ ${rackPad})`,
        stageSubtitle: "Rê chuột từ trái sang phải để lướt dọc qua 3 khoang kệ: Đầu kệ -> Giữa kệ -> Cuối kệ",
      };
    }
    if (viewAngle === "FARM_AISLE_PANORAMA") {
      return {
        bay1ImageUrl: "/images/real-farm/real-farm-racks-1.jpg",
        bay2ImageUrl: "/images/real-farm/real-farm-racks-2.jpg",
        bay3ImageUrl: "/images/real-farm/real-farm-racks-3.jpg",
        imageCaption: `Hành lang kệ phôi nấm đa tầng thực tế kéo dài tại khu vực Kệ ${rackPad}`,
        stageSubtitle: "Lướt chuột ngang hết khung hình để kiểm tra từ đầu dãy kệ tới kịch cuối dãy kệ (0% -> 100%)",
      };
    }

    // Góc nhìn 1: Cận cảnh khay & phôi nấm thực tế dọc 3 khoang kệ
    if (isMaintenance) {
      return {
        bay1ImageUrl: "/images/real-farm/real-farm-racks-3.jpg",
        bay2ImageUrl: "/images/real-farm/real-farm-racks-2.jpg",
        bay3ImageUrl: "/images/real-farm/real-farm-racks-1.jpg",
        imageCaption: `Kệ phôi ${tray.trayCode} đang trong quy trình kiểm tra & khử trùng định kỳ`,
        stageSubtitle: "Trạng thái: Đang bảo trì kỹ thuật & kiểm định nắp lọc khuẩn dọc dãy kệ",
      };
    }
    if (!isOccupied) {
      return {
        bay1ImageUrl: "/images/real-farm/real-farm-racks-2.jpg",
        bay2ImageUrl: "/images/real-farm/real-farm-racks-3.jpg",
        bay3ImageUrl: "/images/real-farm/real-farm-racks-1.jpg",
        imageCaption: `Bịch phôi nấm vô trùng đậy nắp lọc khuẩn tại Khay ${shortCode} (Sẵn sàng cấy giống)`,
        stageSubtitle: "Trạng thái: Phôi cơ chất đã hấp tiệt trùng, sẵn sàng cấp phát cho đơn thuê mới",
      };
    }

    const sp = (tray.speciesName || "").toLowerCase();
    if (sp.includes("linh chi")) {
      return {
        bay1ImageUrl: "/images/real-farm/real-reishi-macro.jpg",
        bay2ImageUrl: "/images/real-farm/real-farm-racks-1.jpg",
        bay3ImageUrl: "/images/real-farm/real-reishi-macro.jpg",
        imageCaption: `Ảnh thực tế quả thể Nấm Linh Chi Đỏ (Ganoderma lucidum) tại Khay ${shortCode}`,
        stageSubtitle: "Quả thể đang hóa gỗ vành vàng, hàm lượng Polysaccharide đạt chuẩn dược liệu",
      };
    }
    if (sp.includes("hầu thủ") || sp.includes("hương")) {
      return {
        bay1ImageUrl: "/images/real-farm/real-lionsmane-macro.jpg",
        bay2ImageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
        bay3ImageUrl: "/images/real-farm/real-lionsmane-macro.jpg",
        imageCaption: `Ảnh thực tế quả thể nấm dược liệu đang phát triển tại Khay ${shortCode}`,
        stageSubtitle: "Cấu trúc gai nấm trắng đồng đều, độ ẩm bề mặt tối ưu",
      };
    }

    const variant = (tray.trayId + tray.shelfLevel) % 3;
    if (variant === 0) {
      return {
        bay1ImageUrl: "/images/real-farm/real-mushroom-shelves.jpg",
        bay2ImageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
        bay3ImageUrl: "/images/real-farm/real-oyster-macro.jpg",
        imageCaption: `Ảnh thực tế cụm Nấm Bào Ngư Xám bung tán từ bịch phôi tại Khay ${shortCode}`,
        stageSubtitle: "Giai đoạn 4: Cụm tai nấm bung đều, rê chuột sang phải để xem tiếp các khay cuối kệ",
      };
    }
    if (variant === 1) {
      return {
        bay1ImageUrl: "/images/real-farm/real-oyster-macro.jpg",
        bay2ImageUrl: "/images/real-farm/real-mushroom-shelves.jpg",
        bay3ImageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
        imageCaption: `Ảnh thực tế hệ sợi tơ trắng & nụ mầm Nấm Bào Ngư Xám tại Khay ${shortCode}`,
        stageSubtitle: "Giai đoạn 3: Hệ sợi tơ ăn kín bề mặt giá thể, nụ nấm non kết cụm dày đặc",
      };
    }
    return {
      bay1ImageUrl: "/images/real-farm/real-cleanroom-cultivation.jpg",
      bay2ImageUrl: "/images/real-farm/real-mushroom-shelves.jpg",
      bay3ImageUrl: "/images/real-farm/real-oyster-macro.jpg",
      imageCaption: `Ảnh thực tế khay nấm canh tác trên kệ phòng sạch tại Khay ${shortCode}`,
      stageSubtitle: "Giai đoạn 4: Thân nấm vươn thẳng đồng đều trên khay tiêu chuẩn",
    };
  })();

  /**
   * TÍNH TOÁN KÍCH THƯỚC DẢI KỆ PANORAMA 3 KHOANG (260% * ZOOM) & KHÓA BIÊN 0% VIỀN ĐEN
   * - Dải kệ Panorama 3 khoang rộng gấp 2.6 lần khung nhìn (260% * zoom) và cao gấp 1.36 lần (136% * zoom).
   * - Khi railPos.x đi từ 0% -> 100%, mép trái của dải kệ trượt từ 0% đến vừa khít mép phải 100% khung nhìn.
   */
  const canvasWidthPct = Number((260 * zoom).toFixed(2));
  const canvasHeightPct = Number((136 * zoom).toFixed(2));
  const maxShiftXOfCanvas = ((canvasWidthPct - 100) / canvasWidthPct) * 100;
  const maxShiftYOfCanvas = ((canvasHeightPct - 100) / canvasHeightPct) * 100;
  const translateXPct = Number((-((railPos.x / 100) * maxShiftXOfCanvas)).toFixed(3));
  const translateYPct = Number((-((railPos.y / 100) * maxShiftYOfCanvas)).toFixed(3));

  // Tọa độ vật lý cố định của khay đang chọn trên dải kệ 3 khoang (dùng để neo cố định khung AI Vision)
  const totalTraysOnRack = traysOnCurrentRack.length;
  const selectedTrayPhysicalX =
    totalTraysOnRack > 1
      ? 7 + (currentRackTrayIndex / (totalTraysOnRack - 1)) * 84
      : 50;
  const selectedTrayPhysicalY = 20 + (((tray.shelfLevel || 1) - 1) % 5) * 13;

  // Khung ống kính hiện tại trên thanh Radar Minimap (tỷ lệ phần trăm bề rộng kệ đang nằm trong khung nhìn)
  const radarViewportWidthPct = Number(Math.min(100, (100 / canvasWidthPct) * 100).toFixed(2));
  const radarViewportLeftPct = Number(
    ((railPos.x / 100) * (100 - radarViewportWidthPct)).toFixed(2)
  );

  // Đo kích thước khung nhìn 1 lần khi chuột đi vào (Measure Once — tránh Layout Thrashing trong onMouseMove)
  const handleMouseEnter = () => {
    if (viewportRef.current) {
      cachedRectRef.current = viewportRef.current.getBoundingClientRect();
    }
    if (hoverPanEnabled && !autoPatrol) {
      setIsPointerTracking(true);
    }
  };

  // Rê chuột (Hover Move) hoặc Kéo chuột (Click & Drag) phản hồi 1:1 ở 60/120fps
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cachedRectRef.current || viewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;

    // 1. Chế độ Kéo giữ chuột (Drag-to-Pan)
    if (isDragging && dragStartRef.current) {
      setIsPointerTracking(true);
      const deltaX = ((dragStartRef.current.clientX - e.clientX) / rect.width) * 115;
      const deltaY = ((dragStartRef.current.clientY - e.clientY) / rect.height) * 115;
      setRailPos({
        x: clampPct(dragStartRef.current.startX + deltaX),
        y: clampPct(dragStartRef.current.startY + deltaY),
      });
      return;
    }

    // 2. Chế độ Rê chuột tự do (Hover Pan): ánh xạ toàn dải kệ 0% -> 100% với biên đệm 7% ở 2 đầu
    if (!hoverPanEnabled || autoPatrol) return;
    setIsPointerTracking(true);
    const rawRatioX = (e.clientX - rect.left) / rect.width;
    const rawRatioY = (e.clientY - rect.top) / rect.height;

    const mappedX = ((rawRatioX - 0.07) / 0.86) * 100;
    const mappedY = ((rawRatioY - 0.08) / 0.84) * 100;

    setRailPos({
      x: clampPct(mappedX),
      y: clampPct(mappedY),
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) {
      return;
    }
    if (viewportRef.current) {
      cachedRectRef.current = viewportRef.current.getBoundingClientRect();
    }
    setAutoPatrol(false);
    setIsDragging(true);
    setIsPointerTracking(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: railPos.x,
      startY: railPos.y,
    };
  };

  const handleMouseUpOrLeave = () => {
    // Giữ nguyên vị trí camera tại kệ cuối nơi người dùng dừng chuột
    setIsDragging(false);
    setIsPointerTracking(false);
    dragStartRef.current = null;
  };

  // Nhấp trực tiếp trên thanh Radar Minimap để đưa ống kính đến vị trí bất kỳ dọc kệ
  const handleRadarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarTrackRef.current) return;
    const rect = radarTrackRef.current.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    setAutoPatrol(false);
    setIsPointerTracking(false);
    setRailPos((prev) => ({ ...prev, x: clampPct(clickRatio * 100) }));
  };

  const handleNudgeRail = (dx: number, dy: number) => {
    setAutoPatrol(false);
    setIsPointerTracking(false);
    setRailPos((prev) => ({
      x: clampPct(prev.x + dx),
      y: clampPct(prev.y + dy),
    }));
  };

  const handleResetCamera = () => {
    setAutoPatrol(false);
    setIsPointerTracking(false);
    setZoom(1.15);
    const targetX =
      totalTraysOnRack > 1
        ? clampPct((currentRackTrayIndex / (totalTraysOnRack - 1)) * 100)
        : 50;
    setRailPos({ x: targetX, y: 45 });
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

  const handleTriggerLocalMist = async () => {
    if (isMistingLocal) return;
    setIsMistingLocal(true);
    setSpectrum("HUMID_MIST");
    try {
      await onTriggerHardwareMist?.();
    } catch {
      // Bỏ qua nếu đang ở chế độ khách chỉ xem
    }
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
      <div className="my-auto w-full max-w-6xl rounded-3xl bg-[#FDFBF8] dark:bg-[#1E1B18] border border-[#DECFC0] dark:border-[#474039] shadow-2xl overflow-hidden text-[#24170E] dark:text-[#FFF5EA]">
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
                  <span>3-BAY PANORAMA RAIL • 60FPS ZERO-BORDER</span>
                </span>
              </div>
              <p className="text-xs text-[#D8C4B0] mt-0.5 tabular-nums">
                Buồng {roomCode} • Kệ số {rackPad} • Tầng số {shelfPad} • Rê chuột ngang từ trái sang phải để trượt dọc qua 3 khoang kệ
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
        <div className="px-5 sm:px-6 py-2.5 bg-[#F4ECE1] dark:bg-[#27231F] border-b border-[#E3D5C3] dark:border-[#474039] flex flex-wrap items-center justify-between gap-3 text-xs">
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
                      : "bg-white dark:bg-[#322D28] text-[#523522] dark:text-[#DAC7B5] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58]"
                  }`}
                >
                  Kệ {String(rNum).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          {/* Các khay nằm trên Kệ hiện tại để nhảy nhanh từ đầu kệ đến cuối kệ */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
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
                      : "bg-white dark:bg-[#322D28] text-[#4A3222] dark:text-[#DAC7B5] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58]"
                  }`}
                  title={`Trượt camera tới Khay ${t.trayCode} (Tầng ${t.shelfLevel})`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                  <span>#{sCode}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Nội Dung Chính 2 Cột */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* ==========================================================
              CỘT TRÁI (7 CỘT): MÀN HÌNH CAMERA PANORAMA 3 KHOANG & RADAR MINIMAP
          ========================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
            {/* Thanh Chọn Góc Camera Thực Tế & Điều Khiển Chuyển Động */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-[#F4ECE1] dark:bg-[#27231F] p-1 rounded-2xl border border-[#E0D3C1] dark:border-[#474039]">
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
                      onClick={() => setViewAngle(tab.id)}
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
                      : "bg-[#FAF5EE] dark:bg-[#27231F] text-[#523522] dark:text-[#E2BA78] border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${autoPatrol ? "bg-emerald-300 animate-ping" : "bg-[#C28E58]"}`} />
                  <span>{autoPatrol ? "Đang Tuần Tra Kệ..." : "Tự Động Lia Kệ"}</span>
                </button>
              </div>
            </div>

            {/* KHUNG VIEWPORT CAMERA PANORAMA 3 KHOANG (RÊ CHUỘT 1:1 60FPS, 0% VIỀN ĐEN) */}
            <div
              ref={viewportRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="relative rounded-3xl overflow-hidden border-2 border-[#DECFC0] dark:border-[#474039] bg-[#1A130E] shadow-xl aspect-[16/10] select-none cursor-grab active:cursor-grabbing group"
            >
              {/* DẢI KỆ PANORAMA 3 KHOANG RỘNG 260% * ZOOM (TẮT TRANSITION KHI ĐANG RÊ CHUỘT TRỰC TIẾP ĐỂ ĐẠT 60FPS TỨC THÌ) */}
              <div
                className={`absolute top-0 left-0 grid grid-cols-3 will-change-transform ${
                  isPointerTracking ? "" : "transition-transform duration-300 ease-out"
                } ${isTransitioningTray ? "opacity-90" : "opacity-100"}`}
                style={{
                  width: `${canvasWidthPct}%`,
                  height: `${canvasHeightPct}%`,
                  transform: `translate3d(${translateXPct}%, ${translateYPct}%, 0)`,
                }}
              >
                {/* KHOANG 1 (0% -> 33% DẢI KỆ): DÃY KHAY ĐẦU KỆ */}
                <div className="relative w-full h-full overflow-hidden border-r-2 border-stone-400/35">
                  <img
                    src={bay1ImageUrl}
                    alt={`${imageCaption} - Khoang đầu kệ`}
                    draggable={false}
                    className={`w-full h-full object-cover ${
                      spectrum === "HUMID_MIST"
                        ? "brightness-95 contrast-105"
                        : spectrum === "UVC_INSPECT"
                        ? "hue-rotate-15 contrast-110 brightness-90"
                        : "brightness-100"
                    }`}
                  />
                  <div className="absolute top-12 left-4 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-xs text-[10px] font-bold text-[#E2BA78] border border-white/15 pointer-events-none">
                    KHOANG ĐẦU KỆ {rackPad} (0% – 33%)
                  </div>
                </div>

                {/* KHOANG 2 (33% -> 66% DẢI KỆ): DÃY KHAY GIỮA KỆ */}
                <div className="relative w-full h-full overflow-hidden border-r-2 border-stone-400/35">
                  <img
                    src={bay2ImageUrl}
                    alt={`${imageCaption} - Khoang giữa kệ`}
                    draggable={false}
                    className={`w-full h-full object-cover ${
                      spectrum === "HUMID_MIST"
                        ? "brightness-95 contrast-105"
                        : spectrum === "UVC_INSPECT"
                        ? "hue-rotate-15 contrast-110 brightness-90"
                        : "brightness-100"
                    }`}
                  />
                  <div className="absolute top-12 left-4 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-xs text-[10px] font-bold text-sky-300 border border-white/15 pointer-events-none">
                    KHOANG GIỮA KỆ {rackPad} (33% – 66%)
                  </div>
                </div>

                {/* KHOANG 3 (66% -> 100% DẢI KỆ): DÃY KHAY CUỐI KỆ */}
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={bay3ImageUrl}
                    alt={`${imageCaption} - Khoang cuối kệ`}
                    draggable={false}
                    className={`w-full h-full object-cover ${
                      spectrum === "HUMID_MIST"
                        ? "brightness-95 contrast-105"
                        : spectrum === "UVC_INSPECT"
                        ? "hue-rotate-15 contrast-110 brightness-90"
                        : "brightness-100"
                    }`}
                  />
                  <div className="absolute top-12 right-4 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-xs text-[10px] font-bold text-emerald-300 border border-white/15 pointer-events-none">
                    KHOANG CUỐI KỆ {rackPad} (66% – 100%)
                  </div>
                </div>

                {/* Khung Nhận Diện AI Vision Neo Cố Định Theo Tọa Độ Vật Lý Của Khay Đang Chọn Trên Dải Kệ */}
                {showAiBoxes && isOccupied && (
                  <>
                    <div
                      className="absolute w-[14%] h-[36%] -translate-x-1/2 -translate-y-1/2 border-2 border-emerald-400/90 rounded-2xl bg-emerald-500/10 pointer-events-none shadow-lg"
                      style={{
                        left: `${selectedTrayPhysicalX}%`,
                        top: `${Math.min(72, Math.max(28, selectedTrayPhysicalY + 12))}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-700/95 text-white text-[10px] font-bold whitespace-nowrap tabular-nums shadow-xs">
                        Quả Thể ({shortCode}) • ĐK: {62 + seed}mm • Đạt 98.6%
                      </div>
                    </div>
                  </>
                )}

                {/* CÁC ĐIỂM NEO KHAY THỰC TẾ DỌC SUỐT CHIỀU DÀI 3 KHOANG KỆ (TỪ ĐẦU KỆ #001 TỚI KỊCH CUỐI KỆ #010) */}
                {traysOnCurrentRack.map((t, idx) => {
                  const total = traysOnCurrentRack.length;
                  const posXPct = total > 1 ? 7 + (idx / (total - 1)) * 84 : 50;
                  const posYPct = 20 + (((t.shelfLevel || 1) - 1) % 5) * 13;
                  const isCurrent = t.trayId === tray.trayId;
                  const sCode = formatShortCode(t);
                  return (
                    <button
                      key={t.trayId}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTray(t);
                      }}
                      style={{
                        left: `${posXPct}%`,
                        top: `${posYPct}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl text-[11px] font-bold tabular-nums transition shadow-lg flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? "bg-emerald-700 text-white border-2 border-emerald-300 scale-110 z-20 ring-4 ring-emerald-500/30"
                          : "bg-black/75 hover:bg-emerald-900/90 text-white/90 border border-white/30 z-10"
                      }`}
                      title={`Nhấp để xem Khay ${t.trayCode} (Kệ ${t.rackNumber} • Tầng ${t.shelfLevel})`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t.status === "OCCUPIED"
                            ? "bg-emerald-400 animate-pulse"
                            : t.status === "MAINTENANCE"
                            ? "bg-amber-400"
                            : "bg-stone-300"
                        }`}
                      />
                      <span>{sCode} • T{t.shelfLevel}</span>
                    </button>
                  );
                })}
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

              {/* HUD Góc Trên Trái: Vị Trí Đường Ray (0% -> 100%) & Zoom */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none tabular-nums">
                <div className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE • {roomCode}-KỆ {rackPad}</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[#E2BA78] text-[11px] font-bold">
                  Zoom: {zoom.toFixed(1)}x • Ray kệ: {Math.round(railPos.x)}% (
                  {railPos.x >= 66 ? "Khoang Cuối Kệ" : railPos.x <= 33 ? "Khoang Đầu Kệ" : "Khoang Giữa Kệ"})
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
              <div className="absolute bottom-14 right-3 flex flex-col gap-1 bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 text-white text-xs z-30">
                <div className="grid grid-cols-3 gap-1">
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudgeRail(0, -18)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Lia camera lên tầng trên"
                  >
                    ↑
                  </button>
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudgeRail(-20, 0)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Trượt camera về phía đầu kệ"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCamera}
                    className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                    title="Đặt lại tâm camera vào khay đang chọn"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeRail(20, 0)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center font-bold cursor-pointer"
                    title="Trượt camera về phía cuối kệ"
                  >
                    →
                  </button>
                  <div />
                  <button
                    type="button"
                    onClick={() => handleNudgeRail(0, 18)}
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
              <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3.5 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white flex flex-wrap items-center justify-between gap-2 text-xs z-30">
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
                    title="Bật/Tắt tự động trượt ray khi rê chuột"
                  >
                    {hoverPanEnabled ? "Rê Chuột: Bật" : "Rê Chuột: Khóa (Kéo tay)"}
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

            {/* THANH RADAR MINIMAP ỐNG KÍNH SCADA & ĐƯỜNG RAY KỆ (0% ĐẦU KỆ ────[ỐNG KÍNH]──── 100% CUỐI KỆ) */}
            <div className="p-3 rounded-2xl bg-[#F4ECE1] dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#4A3222] dark:text-[#E2BA78] tabular-nums">
                    Radar Ống Kính Kệ {rackPad}:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPatrol(false);
                      setIsPointerTracking(false);
                      setRailPos((p) => ({ ...p, x: 0 }));
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                      railPos.x <= 25
                        ? "bg-[#24170E] text-white border-[#24170E] dark:bg-[#C28E58] dark:text-[#170E08]"
                        : "bg-white dark:bg-[#322D28] text-[#523522] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                    }`}
                  >
                    Đầu Kệ (0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPatrol(false);
                      setIsPointerTracking(false);
                      setRailPos((p) => ({ ...p, x: 50 }));
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                      railPos.x > 25 && railPos.x < 75
                        ? "bg-[#24170E] text-white border-[#24170E] dark:bg-[#C28E58] dark:text-[#170E08]"
                        : "bg-white dark:bg-[#322D28] text-[#523522] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                    }`}
                  >
                    Giữa Kệ (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPatrol(false);
                      setIsPointerTracking(false);
                      setRailPos((p) => ({ ...p, x: 100 }));
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition cursor-pointer ${
                      railPos.x >= 75
                        ? "bg-[#24170E] text-white border-[#24170E] dark:bg-[#C28E58] dark:text-[#170E08]"
                        : "bg-white dark:bg-[#322D28] text-[#523522] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#474039]"
                    }`}
                  >
                    Cuối Kệ (100%)
                  </button>
                </div>

                <span className="font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums">
                  Tọa độ ray: {Math.round(railPos.x)}% / 100%
                </span>
              </div>

              {/* Thanh Radar Trực Quan Hiển Thị Vùng Phủ Ống Kính Hiện Tại & Các Chấm Khay #001 -> #010 */}
              <div
                ref={radarTrackRef}
                onClick={handleRadarClick}
                className="relative h-7 rounded-xl bg-[#24170E] dark:bg-[#1E1B18] border border-[#C28E58]/40 overflow-hidden cursor-pointer select-none flex items-center"
                title="Nhấp vào vị trí bất kỳ trên thanh Radar để trượt ống kính camera tới khoang kệ đó"
              >
                {/* Vạch chia 3 khoang kệ */}
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none text-[9px] font-bold text-white/35">
                  <div className="border-r border-white/15 flex items-center pl-2">KHOANG ĐẦU</div>
                  <div className="border-r border-white/15 flex items-center justify-center">KHOANG GIỮA</div>
                  <div className="flex items-center justify-end pr-2">KHOANG CUỐI</div>
                </div>

                {/* Các chấm vị trí khay trên thanh Radar */}
                {traysOnCurrentRack.map((t, idx) => {
                  const total = traysOnCurrentRack.length;
                  const dotLeftPct = total > 1 ? 6 + (idx / (total - 1)) * 88 : 50;
                  const active = t.trayId === tray.trayId;
                  return (
                    <div
                      key={t.trayId}
                      style={{ left: `${dotLeftPct}%` }}
                      className={`absolute -translate-x-1/2 rounded-full pointer-events-none transition-all ${
                        active
                          ? "w-3 h-3 bg-emerald-400 ring-2 ring-white z-20"
                          : t.status === "OCCUPIED"
                          ? "w-2 h-2 bg-emerald-500/80 z-10"
                          : t.status === "MAINTENANCE"
                          ? "w-2 h-2 bg-amber-400/90 z-10"
                          : "w-2 h-2 bg-stone-400/80 z-10"
                      }`}
                    />
                  );
                })}

                {/* Khung Chữ Nhật Ống Kính Hiện Tại (Current Viewport Window) */}
                <div
                  className="absolute top-0.5 bottom-0.5 rounded-lg border-2 border-emerald-400 bg-emerald-500/20 pointer-events-none shadow-xs"
                  style={{
                    left: `${radarViewportLeftPct}%`,
                    width: `${radarViewportWidthPct}%`,
                  }}
                />
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
                className="py-3 px-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] hover:border-[#C28E58] text-[#3B2516] dark:text-[#E2BA78] font-bold text-xs border border-[#DECFC0] dark:border-[#474039] shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
              <div className="p-4 rounded-2xl bg-white dark:bg-[#27231F] border border-[#E3D5C3] dark:border-[#474039] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#474039] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78]">
                    Cảm Biến Tại Kệ {rackPad} • Tầng {shelfPad}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Hoạt động tốt
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs tabular-nums">
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#322D28] border border-[#EAE0D3] dark:border-[#474039]">
                    <span className="text-[11px] text-[#8C6D53] block">Nhiệt độ tâm phôi</span>
                    <strong className="text-base font-extrabold text-[#24170E] dark:text-white mt-0.5 block">
                      {localTemp} °C
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#322D28] border border-[#EAE0D3] dark:border-[#474039]">
                    <span className="text-[11px] text-[#8C6D53] block">Độ ẩm không khí</span>
                    <strong className="text-base font-extrabold text-emerald-800 dark:text-emerald-400 mt-0.5 block">
                      {localHumidity} %
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#322D28] border border-[#EAE0D3] dark:border-[#474039]">
                    <span className="text-[11px] text-[#8C6D53] block">Nồng độ khí CO₂</span>
                    <strong className="text-base font-extrabold text-[#24170E] dark:text-white mt-0.5 block">
                      {localCo2} ppm
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#322D28] border border-[#EAE0D3] dark:border-[#474039]">
                    <span className="text-[11px] text-[#8C6D53] block">Cường độ ánh sáng</span>
                    <strong className="text-base font-extrabold text-[#8C3A16] dark:text-[#E2BA78] mt-0.5 block">
                      {localLux} Lux
                    </strong>
                  </div>
                </div>
              </div>

              {/* Khối 2: Tiến Độ Chu Kỳ Sinh Trưởng Thực Tế */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#27231F] border border-[#E3D5C3] dark:border-[#474039] space-y-3 shadow-2xs">
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
                            ? "border-[#DECFC0] dark:border-[#474039] bg-[#FAF6F0] dark:bg-[#322D28] font-semibold text-[#4A3222] dark:text-[#DAC7B5]"
                            : "border-dashed border-[#DECFC0] dark:border-[#474039] text-[#8C6D53] opacity-70"
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
              <div className="p-4 rounded-2xl bg-white dark:bg-[#27231F] border border-[#E3D5C3] dark:border-[#474039] space-y-2.5 text-xs shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] border-b border-[#F0E6D8] dark:border-[#474039] pb-2">
                  Hồ Sơ Định Danh &amp; Hợp Đồng
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#B9ADA1]">Mã định danh khay:</span>
                  <strong className="font-bold tabular-nums">{tray.trayCode}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#B9ADA1]">Tọa độ kệ nuôi:</span>
                  <strong className="font-bold tabular-nums">
                    Kệ {rackPad} • Tầng {shelfPad} (Buồng {roomCode})
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#B9ADA1]">Trạng thái vận hành:</span>
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
                      <span className="text-[#8C6D53] dark:text-[#B9ADA1]">Số hợp đồng FaaS:</span>
                      <strong className="font-bold text-[#8C3A16] dark:text-[#E2BA78]">
                        {tray.orderCode || `ORD-2026-${String(tray.trayId).padStart(3, "0")}`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#B9ADA1]">Chủ sở hữu:</span>
                      <strong className="font-bold">{tray.customerName || "Phạm Minh An"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D53] dark:text-[#B9ADA1]">Giống nấm canh tác:</span>
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
            <div className="pt-3 border-t border-[#E3D5C3] dark:border-[#474039] flex flex-wrap items-center justify-between gap-2.5">
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
                className="px-5 py-3 rounded-xl bg-[#FAF5EE] dark:bg-[#322D28] hover:bg-[#EAE0D3] text-[#523522] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#474039] text-xs font-bold transition cursor-pointer"
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
