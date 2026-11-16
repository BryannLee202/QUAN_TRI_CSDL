"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ChamberView {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  image: string;
  temp: string;
  hum: string;
  co2: string;
  desc: string;
}

const chamberViews: ChamberView[] = [
  {
    id: "cube",
    name: "Buồng Nuôi Thông Minh 3D",
    shortName: "Buồng Kính 3D",
    badge: "Buồng Nuôi ISO Class 5 • Cảm Biến IoT 24/7",
    image: "/images/hero-chamber-warm-champagne.jpg",
    temp: "24.2°C",
    hum: "92%",
    co2: "620 ppm",
    desc: "Buồng kính lập phương vô trùng kiểm soát vi khí hậu độc lập, tích hợp phun sương siêu âm và camera góc rộng",
  },
  {
    id: "facility",
    name: "Dàn Nuôi Đa Tầng Quy Mô Lớn",
    shortName: "Dàn Nuôi Đa Tầng",
    badge: "Smart Multi-Tier FaaS Farm",
    image: "/images/hero-view-facility-multitier.jpg",
    temp: "25.0°C",
    hum: "88%",
    co2: "590 ppm",
    desc: "Hệ thống giá kệ nuôi cấy tự động khép kín chuẩn VietGAP với điều hòa đối lưu không khí hai chiều",
  },
  {
    id: "control",
    name: "Trung Tâm Điều Hành Giám Sát",
    shortName: "Phòng Điều Hành",
    badge: "Central Telemetry Hub",
    image: "/images/hero-view-operator-hub.jpg",
    temp: "22.5°C",
    hum: "65%",
    co2: "450 ppm",
    desc: "Màn hình giám sát tập trung toàn bộ buồng nuôi, tiếp nhận lệnh thu hoạch và cảnh báo bất thường",
  },
  {
    id: "macro",
    name: "Cận Cảnh Nấm Dược Liệu 4K",
    shortName: "Cận Cảnh 4K",
    badge: "Camera Giám Sát 4K Trực Tuyến",
    image: "/images/hero-view-mushroom-macro.jpg",
    temp: "24.5°C",
    hum: "94%",
    co2: "610 ppm",
    desc: "Góc nhìn macro cận cảnh từng cụm nấm phát triển căng tràn sức sống qua ống kính camera 4K sắc nét",
  },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [lightingMode, setLightingMode] = useState<'day' | 'night' | 'uv'>('day');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const currentView = chamberViews[activeTab];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: Number((x * 6).toFixed(2)), y: Number((-y * 6).toFixed(2)) });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="relative bg-gradient-to-b from-[#FDFBF8] via-[#F8F3EC] to-[#FDFBF8] dark:from-[#170E08] dark:via-[#140D07] dark:to-[#170E08] text-[#24170E] dark:text-[#F7EFE6] pt-6 sm:pt-10 pb-12 sm:pb-20 px-6 overflow-hidden transition-colors">
      {/* Background Subtle Warm Caramel Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E5D7C3]/40 dark:bg-[#3B2516]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Split: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Cột Trái: Tiêu đề, Thông điệp & CTA */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left pt-1">
            {/* High-End Telemetry Pill Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-[#20140D]/90 border border-[#E0D3C1] dark:border-[#543825] text-xs font-semibold text-[#523522] dark:text-[#E2BA78] shadow-xs backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C28E58] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C28E58]"></span>
              </span>
              <span className="text-[#3A2315] dark:text-[#F5E6D0] font-bold">Vận Hành 24/7</span>
              <span className="text-[#C28E58]">•</span>
              <span>120 Buồng Nuôi ISO Class 5</span>
              <span className="text-[#C28E58] hidden sm:inline">•</span>
              <span className="text-[#7A573C] dark:text-[#D1B89D] hidden sm:inline">AI Llama-3.1-8B Giám Sát</span>
            </div>

            {/* Headline chính */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#24170E] dark:text-white">
              Nông Trại Nấm Thông Minh{" "}
              <span className="bg-gradient-to-r from-[#5C3A24] via-[#8C5A37] to-[#C28E58] dark:from-[#F0DFCD] dark:via-[#DDB988] dark:to-[#C28E58] bg-clip-text text-transparent">
                Trong Tầm Tay Của Bạn
              </span>
            </h1>

            {/* Mô tả giải pháp */}
            <p className="text-[#634936] dark:text-[#DAC7B5] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Trải nghiệm mô hình nuôi trồng nấm dược liệu công nghệ cao khép kín chuẩn ISO: Thuê khay nấm trực tuyến, giám sát vi khí hậu 24/7 qua cảm biến IoT & Camera Live Stream, nhận nấm tươi thu hoạch tận nhà.
            </p>

            {/* Cụm Nút CTA Kép - Phương án 1: Deep Espresso & Champagne Gold */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              <a
                href="#packages"
                className="px-6 py-3.5 rounded-xl bg-[#24170E] hover:bg-[#382417] text-white font-bold text-sm border border-[#C28E58]/35 shadow-lg shadow-[#24170E]/20 hover:shadow-xl hover:border-[#C28E58] transition duration-200 transform hover:-translate-y-0.5 flex items-center gap-2.5 group"
              >
                <span>Thuê Khay Ngay (Khám Phá)</span>
                <span className="text-[#E2BA78] group-hover:translate-x-0.5 transition-transform font-bold">→</span>
              </a>

              <a
                href="#portal"
                className="px-6 py-3.5 rounded-xl bg-white/90 dark:bg-[#20140D]/90 hover:bg-[#FAF5EE] dark:hover:bg-[#2B1C13] text-[#4A3222] dark:text-[#F7EFE6] font-bold text-sm border border-[#E0D3C1] dark:border-[#543825] hover:border-[#C28E58]/60 shadow-xs transition duration-200 flex items-center gap-2 group"
              >
                <span className="relative flex items-center justify-center text-[#8C5A37] dark:text-[#E2BA78]">
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                </span>
                <span>Xem Demo Camera Trực Tiếp</span>
              </a>
            </div>

          </div>

          {/* Cột Phải: Showcase Buồng Kính Hiện Đại */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            
            {/* Bộ Nút Chuyển Đổi Góc Nhìn */}
            <div className="w-full flex items-center justify-between gap-1 p-1 mb-3 rounded-2xl bg-white dark:bg-[#20140D] border border-[#E0D3C1] dark:border-[#543825] shadow-sm">
              {chamberViews.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                    activeTab === idx
                      ? "bg-[#523522] dark:bg-[#C28E58] text-white dark:text-[#170E08] shadow-sm shadow-[#523522]/20"
                      : "text-[#634936] dark:text-[#DAC7B5] hover:text-[#3B2212] dark:hover:text-white hover:bg-[#FAF5EE] dark:hover:bg-[#2B1C13]"
                  }`}
                  title={v.name}
                >
                  <span className="shrink-0">
                    {v.id === "cube" && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z"/>
                        <path d="m3.27 6.96 8.73 4.99 8.73-4.99"/>
                        <path d="M12 22.08V12"/>
                      </svg>
                    )}
                    {v.id === "facility" && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M3 7l9-4 9 4"/>
                      </svg>
                    )}
                    {v.id === "control" && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="3" rx="2"/>
                        <line x1="8" x2="16" y1="21" y2="21"/>
                        <line x1="12" x2="12" y1="17" y2="21"/>
                      </svg>
                    )}
                    {v.id === "macro" && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                        <line x1="12" y1="2" x2="12" y2="5"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                        <line x1="2" y1="12" x2="5" y2="12"/>
                        <line x1="19" y1="12" x2="22" y2="12"/>
                      </svg>
                    )}
                  </span>
                  <span>{v.shortName}</span>
                </button>
              ))}
            </div>

            {/* Thanh Điều Khiển Quang Phổ & Chế Độ Chiếu Sáng Buồng Kính */}
            <div className="w-full flex items-center justify-between gap-2 px-1 mb-2.5">
              <span className="text-[11px] font-bold text-[#8A5C38] dark:text-[#C28E58] uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Quang Phổ &amp; Vi Khí Hậu:
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/90 dark:bg-[#20140D]/90 border border-[#E0D3C1] dark:border-[#543825] shadow-xs text-[10px]">
                <button
                  type="button"
                  onClick={() => setLightingMode('day')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    lightingMode === 'day'
                      ? 'bg-gradient-to-r from-[#523522] to-[#3B2212] text-white shadow-xs'
                      : 'text-[#6E4B33] dark:text-[#DAC7B5] hover:text-[#24170E]'
                  }`}
                >
                  <span>☀️ Ngày (5000K)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightingMode('night')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    lightingMode === 'night'
                      ? 'bg-gradient-to-r from-sky-800 to-sky-950 text-white shadow-xs'
                      : 'text-[#6E4B33] dark:text-[#DAC7B5] hover:text-[#24170E]'
                  }`}
                >
                  <span>🌙 Đêm Ẩm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightingMode('uv')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    lightingMode === 'uv'
                      ? 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-xs'
                      : 'text-[#6E4B33] dark:text-[#DAC7B5] hover:text-[#24170E]'
                  }`}
                >
                  <span>🔬 UV-C Khử Khuẩn</span>
                </button>
              </div>
            </div>

            {/* Khung Kính Showcase Sang Trọng Tương Tác 3D Parallax & Quang Phổ */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E0D3C1] dark:border-[#543825] bg-[#FAF5EE] dark:bg-[#20140D] group transition-all duration-300 hover:border-[#C28E58] hover:shadow-2xl"
              style={{ 
                isolation: 'isolate',
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                transition: 'transform 0.15s ease-out, border-color 0.3s ease'
              }}
            >
              {/* Vùng Hiển Thị Hình Ảnh */}
              <div 
                className="relative aspect-[16/11] w-full bg-[#F5EEE4] dark:bg-[#20140D] overflow-hidden flex items-center justify-center"
                style={{ position: 'relative', minHeight: '380px', height: '440px', maxHeight: '500px' }}
              >
                <Image
                  key={currentView.image}
                  src={currentView.image}
                  alt={currentView.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />

                {/* Lớp Phủ Hiệu Ứng Ánh Sáng Tương Tác Theo Chế Độ Đèn (Day / Night / UV) */}
                {lightingMode === 'day' && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-amber-500/10 via-transparent to-amber-300/5 transition-opacity duration-500" />
                )}
                {lightingMode === 'night' && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-sky-950/40 via-sky-800/15 to-transparent mix-blend-color transition-opacity duration-500" />
                )}
                {lightingMode === 'uv' && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-purple-900/40 via-indigo-700/20 to-purple-500/10 mix-blend-overlay transition-opacity duration-500" />
                )}

                {/* Hạt Bào Tử Nấm & Sương Mù Siêu Âm Bay Lơ Lửng */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-300/60 blur-[0.5px] animate-pulse left-[25%] bottom-[30%]" style={{ animationDuration: '2.5s' }}></span>
                  <span className="absolute w-1 h-1 rounded-full bg-emerald-400/70 blur-[0.5px] animate-ping left-[45%] bottom-[42%]" style={{ animationDuration: '3.8s' }}></span>
                  <span className="absolute w-2 h-2 rounded-full bg-[#E2BA78]/50 blur-[1px] animate-pulse left-[65%] bottom-[25%]" style={{ animationDuration: '4.2s' }}></span>
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-sky-300/60 blur-[0.5px] animate-pulse left-[82%] bottom-[48%]" style={{ animationDuration: '3.2s' }}></span>
                </div>

                {/* Vệt Sáng Phản Quang Quét Chéo Mặt Kính */}
                <div className="absolute -inset-full pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                {/* Badge Trạng Thái Nổi Góc Trên Trái */}
                <div className="absolute top-3 left-3 backdrop-blur-md bg-white/95 dark:bg-[#2B1C13]/95 border border-[#E0D3C1] dark:border-[#543825] text-[#4A3222] dark:text-[#E2BA78] text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C28E58] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C28E58]"></span>
                  </span>
                  <span>{currentView.badge}</span>
                </div>

                {/* 3 Chip Cảm Biến Realtime Nổi Góc Trên Phải Kèm Sóng IoT Telemetry */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <div className="backdrop-blur-md bg-white/95 dark:bg-[#20140D]/95 border border-[#C28E58]/50 text-[#6E4B33] dark:text-[#F5CE76] text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                    </svg>
                    <span>{currentView.temp}</span>
                  </div>
                  <div className="backdrop-blur-md bg-white/95 dark:bg-[#20140D]/95 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                    <span>{currentView.hum}</span>
                  </div>
                  <div className="backdrop-blur-md bg-white/95 dark:bg-[#20140D]/95 border border-amber-600/40 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>
                    </svg>
                    <span>{currentView.co2}</span>
                  </div>
                </div>

                {/* Chú Thích Dưới Đáy Ảnh */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#26170E]/95 via-[#26170E]/60 to-transparent p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-2">
                      <span className="text-[#E2BA78]">●</span>
                      <span>{currentView.name}</span>
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider text-[#FAF5EE] bg-[#523522]/90 border border-[#C28E58]/60 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      IoT Telemetry 24/7
                    </span>
                  </div>
                  <p className="text-xs text-[#EADCC8] line-clamp-1 mt-1 font-normal">
                    {currentView.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi chú gợi ý bấm chọn */}
            <p className="text-[11px] text-[#8C6D53] dark:text-[#B59D89] mt-2.5 text-center font-medium flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Bấm chọn các tab phía trên để chuyển đổi góc nhìn buồng nuôi và cơ sở công nghệ cao thực tế</span>
            </p>
          </div>

        </div>

        {/* Chân Hero: Cụm 4 Thẻ Bento Tính Năng Ngang - Thiết Kế Icon Đa Lớp Thực Tế & Sang Trọng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-16">
          
          {/* Card 1: Mô hình Farm-as-a-Service */}
          <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-2xl p-5 border border-[#E0D3C1] dark:border-[#543825] shadow-xs hover:shadow-xl hover:border-[#C28E58] transition-all duration-300 flex items-start gap-4 group">
            {/* Icon Tile: Buồng Kính Vô Trùng Smart FaaS Thực Tế */}
            <div className="bento-icon-box w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-gradient-to-br from-[#FAF3EA] via-[#F4E8D8] to-[#E8D4BB] dark:from-[#3D2517] dark:via-[#2B190E] dark:to-[#1A0F08] border border-[#D9C4AB] dark:border-[#5C3822] flex items-center justify-center shrink-0 shadow-md shadow-[#C28E58]/10 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 p-2">
              <svg className="bento-svg w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="faas-glass-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C28E58" />
                    <stop offset="0.5" stopColor="#8C5A37" />
                    <stop offset="1" stopColor="#4A2E1D" />
                  </linearGradient>
                  <linearGradient id="faas-shimmer" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF5EA" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#C28E58" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {/* Khung Buồng Kính Ngoài */}
                <rect x="4" y="6" width="24" height="20" rx="4" stroke="url(#faas-glass-grad)" strokeWidth="2" fill="none" />
                {/* Mái Buồng Nuôi Tích Hợp Đèn Quang Phổ */}
                <path d="M4 11H28" stroke="url(#faas-glass-grad)" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="9" y="8" width="14" height="1.5" rx="0.75" fill="#E2BA78" />
                {/* Vệt Kính Phản Quang */}
                <path d="M7 23L13 9" stroke="url(#faas-shimmer)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 23L18 9" stroke="url(#faas-shimmer)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
                {/* Khay Nuôi & Cụm Nấm Sinh Trưởng Bên Trong */}
                <rect x="7" y="21" width="18" height="2.5" rx="1" fill="#6B442C" />
                <path d="M16 14C13.5 14 12 16 12 18H20C20 16 18.5 14 16 14Z" fill="#C28E58" />
                <path d="M15 18V21H17V18H15Z" fill="#8C5A37" />
                <circle cx="16" cy="15.5" r="0.8" fill="#FFF5EA" />
                <circle cx="14" cy="17" r="0.6" fill="#FFF5EA" />
                <circle cx="18" cy="17" r="0.6" fill="#FFF5EA" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA] group-hover:text-[#6B442C] dark:group-hover:text-[#E2BA78] transition-colors">
                Mô hình Farm-as-a-Service
              </h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1 leading-relaxed">
                Thuê khay nấm từ xa, theo dõi chu kỳ cấy giống và nhận nấm tươi tận tay
              </p>
            </div>
          </div>

          {/* Card 2: Cảm Biến IoT Realtime */}
          <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-2xl p-5 border border-[#E0D3C1] dark:border-[#543825] shadow-xs hover:shadow-xl hover:border-emerald-600 transition-all duration-300 flex items-start gap-4 group">
            {/* Icon Tile: Chip Cảm Biến Vi Điện Tử Bio-Tech Đa Kênh */}
            <div className="bento-icon-box w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-gradient-to-br from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0] dark:from-[#064E3B]/80 dark:via-[#065F46]/60 dark:to-[#022C22] border border-emerald-300/80 dark:border-emerald-700/60 flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/10 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 p-2">
              <svg className="bento-svg w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="iot-chip-grad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#059669" />
                    <stop offset="0.7" stopColor="#047857" />
                    <stop offset="1" stopColor="#064E3B" />
                  </linearGradient>
                </defs>
                {/* Chân Tiếp Xúc Kim Loại Vi Mạch 4 Phía */}
                <path d="M12 4V8M16 4V8M20 4V8M12 24V28M16 24V28M20 24V28" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 12H8M4 16H8M4 20H8M24 12H28M24 16H28M24 20H28" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                {/* Thân Chip Trung Tâm Khối Nổi 3D */}
                <rect x="8" y="8" width="16" height="16" rx="3.5" fill="url(#iot-chip-grad)" stroke="#34D399" strokeWidth="1.5" />
                {/* Lõi CPU Vi Khí Hậu & Mạch Khắc Laser */}
                <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#022C22" stroke="#6EE7B7" strokeWidth="1" />
                {/* Điểm Tiếp Nhận Sóng Telemetry & Chấm Đèn Xanh */}
                <circle cx="16" cy="16" r="2" fill="#34D399" />
                <circle cx="16" cy="16" r="3.5" stroke="#A7F3D0" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Cảm Biến IoT Realtime
              </h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1 leading-relaxed">
                Đo vi khí hậu đa điểm 24/7 và kích hoạt rèm lạnh đối lưu tự động qua Socket
              </p>
            </div>
          </div>

          {/* Card 3: Camera Trực Tuyến 24/7 */}
          <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-2xl p-5 border border-[#E0D3C1] dark:border-[#543825] shadow-xs hover:shadow-xl hover:border-sky-600 transition-all duration-300 flex items-start gap-4 group">
            {/* Icon Tile: Ống Kính Camera PTZ 4K Siêu Nét */}
            <div className="bento-icon-box w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD] dark:from-[#0C4A6E]/80 dark:via-[#075985]/60 dark:to-[#082F49] border border-sky-300/80 dark:border-sky-700/60 flex items-center justify-center shrink-0 shadow-md shadow-sky-900/10 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 p-2">
              <svg className="bento-svg w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cam-lens-grad" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0369A1" />
                    <stop offset="0.5" stopColor="#0284C7" />
                    <stop offset="1" stopColor="#082F49" />
                  </linearGradient>
                </defs>
                {/* Thân Camera PTZ Công Nghệ Cao */}
                <rect x="4" y="9" width="18" height="14" rx="3.5" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" />
                {/* Ống Phóng Zoom Góc Rộng Bên Phải */}
                <path d="M22 13L28 9.5V22.5L22 19V13Z" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" strokeLinejoin="round" />
                {/* Vành Thấu Kính Quang Học Đa Lớp */}
                <circle cx="13" cy="16" r="4.5" fill="url(#cam-lens-grad)" stroke="#BAE6FD" strokeWidth="1.2" />
                <circle cx="13" cy="16" r="2.2" fill="#082F49" />
                {/* Ánh Sáng Phản Chiếu Trên Thấu Kính Thủy Tinh */}
                <circle cx="14.2" cy="14.8" r="0.9" fill="#FFFFFF" />
                {/* Đèn Báo Ghi Hình Realtime Đỏ Rực */}
                <circle cx="7.5" cy="12.5" r="1.2" fill="#EF4444" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA] group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                Camera Trực Tuyến 24/7
              </h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1 leading-relaxed">
                Quan sát buồng sạch vô trùng Full HD, lưu trữ timelapse phát triển hàng ngày
              </p>
            </div>
          </div>

          {/* Card 4: Thu Hoạch & Giao Tận Nhà */}
          <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-2xl p-5 border border-[#E0D3C1] dark:border-[#543825] shadow-xs hover:shadow-xl hover:border-amber-600 transition-all duration-300 flex items-start gap-4 group">
            {/* Icon Tile: Hộp Nông Sản Hút Chân Không VietGAP Thực Tế */}
            <div className="bento-icon-box w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-2xl bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] dark:from-[#78350F]/80 dark:via-[#92400E]/60 dark:to-[#451A03] border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-center shrink-0 shadow-md shadow-amber-900/10 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 p-2">
              <svg className="bento-svg w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="box-grad-top" x1="16" y1="5" x2="16" y2="13" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="box-grad-left" x1="5" y1="13" x2="16" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#B45309" />
                    <stop offset="1" stopColor="#78350F" />
                  </linearGradient>
                  <linearGradient id="box-grad-right" x1="16" y1="13" x2="27" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D97706" />
                    <stop offset="1" stopColor="#92400E" />
                  </linearGradient>
                </defs>
                {/* Kiện Hàng 3D Chiều Sâu */}
                {/* Mặt trên hộp */}
                <path d="M16 5L27 11L16 17L5 11L16 5Z" fill="url(#box-grad-top)" stroke="#FDE68A" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Mặt bên trái */}
                <path d="M5 11L16 17V27L5 21V11Z" fill="url(#box-grad-left)" stroke="#B45309" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Mặt bên phải */}
                <path d="M16 17L27 11V21L16 27V17Z" fill="url(#box-grad-right)" stroke="#B45309" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Băng Keo Niêm Phong Hàng Cao Cấp */}
                <path d="M11 8L22 14" stroke="#FFFBEB" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 1.5" />
                {/* Huy Hiệu Chứng Thực VietGAP Giao Tươi */}
                <circle cx="21" cy="20" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M19 20L20.5 21.5L23.5 18.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Thu Hoạch &amp; Giao Tận Nhà
              </h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1 leading-relaxed">
                Nghiệm thu cân ký minh bạch, đóng gói chuẩn VietGAP giao tươi trong ngày
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}