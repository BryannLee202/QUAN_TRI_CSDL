"use client";

import React, { useState, useEffect } from "react";
import type { TrayCell } from "./types";

interface VirtualTrayInspectorModalProps {
  tray: TrayCell | null;
  roomCode: string;
  isUpdatingTray: boolean;
  onClose: () => void;
  onToggleStatus: () => void;
  onActionNotice?: (msg: string) => void;
}

type ViewAngle = "MACRO_TRAY" | "FACILITY_RACK" | "CHAMBER_3D";
type SpectrumMode = "DAY_5000K" | "NIGHT_MIST" | "UVC_STERILE";

const GROWTH_STAGES = [
  { step: 1, label: "Cấy phôi", day: "Ngày 1-3" },
  { step: 2, label: "Ủ sợi tơ", day: "Ngày 4-10" },
  { step: 3, label: "Kết nụ mầm", day: "Ngày 11-16" },
  { step: 4, label: "Nuôi quả thể", day: "Ngày 17-25" },
  { step: 5, label: "Thu hoạch", day: "Ngày 26-30" },
];

export default function VirtualTrayInspectorModal({
  tray,
  roomCode,
  isUpdatingTray,
  onClose,
  onToggleStatus,
  onActionNotice,
}: VirtualTrayInspectorModalProps) {
  const [viewAngle, setViewAngle] = useState<ViewAngle>("MACRO_TRAY");
  const [spectrum, setSpectrum] = useState<SpectrumMode>("DAY_5000K");
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);
  const [isScanningAi, setIsScanningAi] = useState<boolean>(false);
  const [isMistingLocal, setIsMistingLocal] = useState<boolean>(false);
  const [humidityBoost, setHumidityBoost] = useState<number>(0);
  const [aiScanReport, setAiScanReport] = useState<string | null>(null);

  useEffect(() => {
    if (!tray) return;
    setViewAngle("MACRO_TRAY");
    setAiScanReport(null);
    setHumidityBoost(0);
    setIsScanningAi(false);
    setIsMistingLocal(false);
    if (tray.status === "MAINTENANCE") {
      setSpectrum("UVC_STERILE");
    } else {
      setSpectrum("DAY_5000K");
    }
  }, [tray]);

  if (!tray) return null;

  const isOccupied = tray.status === "OCCUPIED";
  const isMaintenance = tray.status === "MAINTENANCE";
  const rackPad = String(tray.rackNumber || 1).padStart(2, "0");
  const shelfPad = String(tray.shelfLevel || 1).padStart(2, "0");

  // Thông số vi khí hậu tính toán nhất quán theo từng khay
  const seed = (tray.trayId || 1) % 7;
  const localTemp = (23.6 + seed * 0.2).toFixed(1);
  const localHumidity = Math.min(98.5, Number((89.5 + seed * 0.5 + humidityBoost).toFixed(1)));
  const localCo2 = 580 + seed * 18;
  const localLux = spectrum === "DAY_5000K" ? 860 : spectrum === "NIGHT_MIST" ? 240 : 120;
  const growthProgress = isOccupied ? 74 + (seed % 15) : isMaintenance ? 100 : 0;

  // Chọn hình ảnh nông trại thực tế theo góc nhìn và trạng thái khay
  const currentImage = (() => {
    if (viewAngle === "FACILITY_RACK") {
      return "/images/hero-view-facility-multitier.jpg";
    }
    if (viewAngle === "CHAMBER_3D") {
      return "/images/chamber-light-hero.png";
    }
    if (isMaintenance) {
      return "/images/hero-chamber-sapphire.jpg";
    }
    if (!isOccupied) {
      return "/images/hero-chamber-light-latte.jpg";
    }
    return "/images/hero-view-mushroom-macro.jpg";
  })();

  const handleTriggerAiScan = () => {
    if (isScanningAi) return;
    setIsScanningAi(true);
    setShowAiBoxes(true);
    setTimeout(() => {
      setIsScanningAi(false);
      const report = isOccupied
        ? `Quét quang học 3D hoàn tất: Mật độ quả thể đạt 98.6%, đường kính tán trung bình ${64 + seed}mm, không phát hiện bào tử nấm lạ.`
        : isMaintenance
        ? "Kiểm định khử khuẩn UV-C hoàn tất: Bề mặt khay đạt độ vô trùng chuẩn ISO Class 5, sẵn sàng mở lại cấp phát."
        : "Kiểm định giá thể hoàn tất: Độ ẩm phôi đạt chuẩn 65%, sẵn sàng tiếp nhận hợp đồng cấy giống mới.";
      setAiScanReport(report);
      onActionNotice?.(`Đã lưu kết quả quét AI cho khay ${tray.trayCode}`);
    }, 1400);
  };

  const handleTriggerLocalMist = () => {
    if (isMistingLocal) return;
    setIsMistingLocal(true);
    setSpectrum("NIGHT_MIST");
    setTimeout(() => {
      setHumidityBoost((prev) => Number((prev + 1.8).toFixed(1)));
      setIsMistingLocal(false);
      onActionNotice?.(`Đã phun sương bù ẩm cục bộ cho khay ${tray.trayCode} (+1.8% RH)`);
    }, 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-5 animate-fade-in overflow-y-auto font-sans"
      role="dialog"
      aria-modal="true"
      aria-label={`Trạm quan sát khay nấm thực tế ${tray.trayCode}`}
    >
      <div className="my-auto w-full max-w-5xl rounded-3xl bg-[#FDFBF8] dark:bg-[#170F0A] border border-[#DECFC0] dark:border-[#4A3222] shadow-2xl overflow-hidden text-[#24170E] dark:text-[#FFF5EA]">
        {/* Thanh Header Trạm Quan Sát */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E130B] via-[#2C1B10] to-[#1A1009] text-white border-b border-[#C28E58]/35 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C28E58] to-[#7A4B2A] flex items-center justify-center shadow-sm border border-[#E8C89B]/40 shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[#FAF5EE] tabular-nums">
                  Trạm Quan Sát Khay Nuôi Thực Tế • {tray.trayCode}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>CAMERA QUANG HỌC 4K TRỰC TUYẾN</span>
                </span>
              </div>
              <p className="text-xs text-[#D8C4B0] mt-0.5 tabular-nums">
                Tọa độ vật lý: Buồng {roomCode} • Kệ số {rackPad} • Tầng số {shelfPad} • Hệ thống Digital Twin FaaS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-[#DAC7B5] hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer shrink-0"
            title="Đóng cửa sổ quan sát"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nội Dung Chính 2 Cột: Cột Trái (Camera Thực Tế 3 Góc Nhìn) + Cột Phải (Thông Số & Điều Phối) */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {/* ==========================================================
              CỘT TRÁI (7 CỘT): MÀN HÌNH QUAN SÁT NÔNG TRẠI & KHAY NẤM THỰC TẾ
          ========================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Thanh Chọn 3 Góc Nhìn Camera & Quang Phổ Ánh Sáng */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-[#F4ECE1] dark:bg-[#22160E] p-1 rounded-2xl border border-[#E0D3C1] dark:border-[#38261A]">
                {[
                  { id: "MACRO_TRAY" as ViewAngle, label: "Cận Cảnh Khay Nấm" },
                  { id: "FACILITY_RACK" as ViewAngle, label: "Dàn Kệ Đa Tầng" },
                  { id: "CHAMBER_3D" as ViewAngle, label: "Buồng Kính 3D" },
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

              {/* Bộ Đổi Quang Phổ Buồng Nuôi */}
              <div className="flex items-center gap-1 bg-[#F4ECE1] dark:bg-[#22160E] p-1 rounded-2xl border border-[#E0D3C1] dark:border-[#38261A] text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSpectrum("DAY_5000K")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                    spectrum === "DAY_5000K"
                      ? "bg-amber-600 text-white"
                      : "text-[#634936] dark:text-[#DAC7B5]"
                  }`}
                >
                  Ngày 5000K
                </button>
                <button
                  type="button"
                  onClick={() => setSpectrum("NIGHT_MIST")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                    spectrum === "NIGHT_MIST"
                      ? "bg-sky-700 text-white"
                      : "text-[#634936] dark:text-[#DAC7B5]"
                  }`}
                >
                  Sương Ẩm
                </button>
                <button
                  type="button"
                  onClick={() => setSpectrum("UVC_STERILE")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                    spectrum === "UVC_STERILE"
                      ? "bg-indigo-700 text-white"
                      : "text-[#634936] dark:text-[#DAC7B5]"
                  }`}
                >
                  UV-C
                </button>
              </div>
            </div>

            {/* Khung Hình Ảnh Thực Tế Kèm Lớp Phủ Telemetry & AI Computer Vision */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#DECFC0] dark:border-[#3D271A] bg-slate-950 shadow-xl aspect-[16/10] group select-none">
              <img
                src={currentImage}
                alt={`Hình ảnh thực tế khay ${tray.trayCode}`}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  spectrum === "NIGHT_MIST"
                    ? "brightness-90 contrast-105 saturate-90"
                    : spectrum === "UVC_STERILE"
                    ? "hue-rotate-15 brightness-90 contrast-110"
                    : "brightness-100"
                }`}
              />

              {/* Lớp phủ màu quang phổ môi trường */}
              {spectrum === "NIGHT_MIST" && (
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/45 via-sky-500/10 to-transparent pointer-events-none" />
              )}
              {spectrum === "UVC_STERILE" && (
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/55 via-purple-600/20 to-sky-500/15 pointer-events-none" />
              )}

              {/* Hiệu ứng Phun Sương Siêu Âm Cục Bộ */}
              {(isMistingLocal || spectrum === "NIGHT_MIST") && (
                <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-sky-100/15 to-transparent animate-pulse pointer-events-none" />
              )}

              {/* Hiệu ứng Tia Laser Quét Kiểm Định AI */}
              {isScanningAi && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-bounce" />
                </div>
              )}

              {/* HUD Góc Trên Trái: Thông Tin Camera & Tọa Độ */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2 pointer-events-none">
                <div className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-2 tabular-nums">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>CAM-{roomCode}-R{rackPad}</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[#E2BA78] text-[11px] font-bold tabular-nums">
                  Kệ {rackPad} • Tầng {shelfPad}
                </div>
              </div>

              {/* HUD Góc Trên Phải: Telemetry Cảm Biến Trực Tiếp Trên Khung Hình */}
              <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 pointer-events-none tabular-nums">
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-amber-300 text-[11px] font-bold">
                  {localTemp}°C
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                  {localHumidity}% RH
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-sky-300 text-[11px] font-bold">
                  {localCo2} ppm
                </span>
              </div>

              {/* Khung Nhận Diện AI Vision (Bounding Boxes) khi ở góc nhìn Cận Cảnh Khay */}
              {showAiBoxes && viewAngle === "MACRO_TRAY" && isOccupied && (
                <>
                  <div className="absolute top-[22%] left-[18%] w-[38%] h-[46%] border-2 border-emerald-400/90 rounded-2xl bg-emerald-500/10 pointer-events-none shadow-lg">
                    <div className="absolute -top-6 left-0 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold whitespace-nowrap tabular-nums shadow-xs">
                      Cụm Quả Thể A1 • {64 + seed}mm • Đạt 98.6%
                    </div>
                  </div>
                  <div className="absolute top-[30%] right-[14%] w-[28%] h-[42%] border-2 border-amber-300/90 rounded-2xl bg-amber-500/10 pointer-events-none">
                    <div className="absolute -top-6 right-0 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-bold whitespace-nowrap tabular-nums shadow-xs">
                      Cụm Quả Thể A2 • Chuẩn VietGAP
                    </div>
                  </div>
                </>
              )}

              {/* Định vị vị trí Khay khi ở góc nhìn Toàn Cảnh Dàn Kệ Đa Tầng */}
              {viewAngle === "FACILITY_RACK" && (
                <div className="absolute top-[34%] left-[28%] px-3.5 py-2 rounded-2xl bg-emerald-900/90 backdrop-blur-md border-2 border-emerald-400 text-white text-xs font-bold shadow-2xl pointer-events-none flex items-center gap-2.5 tabular-nums">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase">Vị Trí Khay Đang Chọn</div>
                    <div>{tray.trayCode} (Kệ {rackPad} • Tầng {shelfPad})</div>
                  </div>
                </div>
              )}

              {/* Thanh Trạng Thái Dưới Chân Khung Hình */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-[#E2BA78] block">
                    {viewAngle === "MACRO_TRAY"
                      ? isOccupied
                        ? `Quan sát cận cảnh: ${tray.speciesName || "Nấm bào ngư xám"} đang phát triển`
                        : isMaintenance
                        ? "Quan sát cận cảnh: Buồng khay đang bật đèn UV-C thanh trùng"
                        : "Quan sát cận cảnh: Khay giá thể vô trùng sẵn sàng nhận đơn thuê"
                      : viewAngle === "FACILITY_RACK"
                      ? `Toàn cảnh dãy kệ phòng sạch ISO Class 5 (${roomCode})`
                      : "Mô hình buồng nuôi kiểm soát vi khí hậu khép kín"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiBoxes((p) => !p)}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold text-emerald-300 border border-white/15 transition cursor-pointer"
                >
                  {showAiBoxes ? "Ẩn Khung AI Vision" : "Hiện Khung AI Vision"}
                </button>
              </div>
            </div>

            {/* Báo cáo kết quả quét AI (nếu vừa bấm Quét AI) */}
            {aiScanReport && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{aiScanReport}</span>
              </div>
            )}

            {/* Cụm Nút Thao Tác Kỹ Thuật Trực Tiếp Trên Khay Nấm Ảo */}
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
                <span>{isScanningAi ? "Đang quét quang học 3D..." : "Quét AI Kiểm Định Sinh Khối"}</span>
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
                <span>{isMistingLocal ? "Đang phun sương nano..." : "Phun Sương Bù Ẩm Cục Bộ"}</span>
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
                    Vi Khí Hậu Đo Trực Tiếp Tại Khay
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Đạt chuẩn ISO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs tabular-nums">
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="text-[11px] text-[#8C6D53] block">Nhiệt độ tâm khay</span>
                    <strong className="text-base font-extrabold text-[#24170E] dark:text-white mt-0.5 block">
                      {localTemp} °C
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="text-[11px] text-[#8C6D53] block">Độ ẩm sương nano</span>
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
                    <span className="text-[11px] text-[#8C6D53] block">Cường độ quang phổ</span>
                    <strong className="text-base font-extrabold text-[#8C3A16] dark:text-[#E2BA78] mt-0.5 block">
                      {localLux} Lux
                    </strong>
                  </div>
                </div>
              </div>

              {/* Khối 2: Tiến Độ Chu Kỳ Sinh Trưởng */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78]">
                    Tiến Độ Chu Kỳ Sinh Trưởng
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums">
                    {isOccupied ? `Hoàn thành ${growthProgress}%` : isMaintenance ? "Đang khử khuẩn" : "Sẵn sàng 100%"}
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
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Vị trí vật lý:</span>
                  <strong className="font-bold tabular-nums">
                    Kệ {rackPad} • Tầng {shelfPad} (Buồng {roomCode})
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#A8907E]">Trạng thái hiện tại:</span>
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
                    Khay đang trống vô trùng, sẵn sàng cấp phát tự động khi khách hàng ký hợp đồng thuê mới.
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
