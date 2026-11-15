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
    image: "/images/chamber-light-hero.png",
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
    image: "/images/view-farm-facility.jpg",
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
    image: "/images/view-operator-hub.jpg",
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
    image: "/images/view-portal-macro.jpg",
    temp: "24.5°C",
    hum: "94%",
    co2: "610 ppm",
    desc: "Góc nhìn macro cận cảnh từng cụm nấm phát triển căng tràn sức sống qua ống kính camera 4K sắc nét",
  },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState(0);
  const currentView = chamberViews[activeTab];

  return (
    <section className="relative bg-gradient-to-b from-[#FDFBF8] via-[#F8F3EC] to-[#FDFBF8] dark:from-[#170E08] dark:via-[#140D07] dark:to-[#170E08] text-[#24170E] dark:text-[#F7EFE6] py-12 sm:py-20 px-6 overflow-hidden transition-colors">
      {/* Background Subtle Warm Caramel Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E5D7C3]/40 dark:bg-[#3B2516]/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Split: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Cột Trái: Tiêu đề, Thông điệp & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#E0D3C1] dark:border-[#543825] text-xs font-semibold text-[#6E4B33] dark:text-[#E2BA78] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#C28E58] animate-ping"></span>
              <span>Nền Tảng Nông Trại Nấm Thông Minh FaaS</span>
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

            {/* Cụm Nút CTA Kép */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#packages"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#523522] to-[#361F12] hover:from-[#3D2517] hover:to-[#24140B] dark:from-[#C28E58] dark:to-[#9E6845] text-white dark:text-[#170E08] font-bold text-sm shadow-md shadow-[#523522]/20 hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Thuê Khay Ngay (Khám Phá)</span>
                <span>→</span>
              </a>

              <a
                href="#portal"
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-[#20140D] hover:bg-[#FAF5EE] dark:hover:bg-[#2B1C13] text-[#4A3222] dark:text-[#F7EFE6] font-bold text-sm border border-[#E0D3C1] dark:border-[#543825] shadow-xs transition flex items-center gap-2 group"
              >
                <span className="relative flex items-center justify-center text-[#B34E2E]">
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 8-6 4 6 4V8Z" />
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                  </svg>
                </span>
                <span>Xem Demo Camera Trực Tiếp</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#8C6D53] dark:text-[#B59D89]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#C28E58] font-bold">✓</span>
                Giao dịch khóa dòng CSDL T-SQL
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#C28E58] font-bold">✓</span>
                Chứng nhận nguồn gốc VietGAP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#C28E58] font-bold">✓</span>
                Bảo hiểm 100% sản lượng
              </span>
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

            {/* Khung Kính Showcase Sang Trọng - Tone Cafe Sữa & Gỗ Ấm Đồng Bộ */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E0D3C1] dark:border-[#543825] bg-[#FAF5EE] dark:bg-[#20140D] group transition-all duration-500 hover:border-[#C28E58]">
              {/* Vùng Hiển Thị Hình Ảnh */}
              <div className="relative aspect-[16/11] w-full bg-[#F5EEE4] dark:bg-[#1A110A] overflow-hidden flex items-center justify-center">
                <Image
                  key={currentView.image}
                  src={currentView.image}
                  alt={currentView.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />

                {/* Badge Trạng Thái Nổi Góc Trên Trái */}
                <div className="absolute top-3 left-3 backdrop-blur-md bg-white/95 dark:bg-[#2B1C13]/95 border border-[#E0D3C1] dark:border-[#543825] text-[#4A3222] dark:text-[#E2BA78] text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C28E58] animate-pulse"></span>
                  <span>{currentView.badge}</span>
                </div>

                {/* 3 Chip Cảm Biến Realtime Nổi Góc Trên Phải */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <div className="backdrop-blur-md bg-white/95 dark:bg-[#20140D]/95 border border-[#C28E58]/50 text-[#6E4B33] dark:text-[#F5CE76] text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                    </svg>
                    <span>{currentView.temp}</span>
                  </div>
                  <div className="backdrop-blur-md bg-white/95 dark:bg-[#20140D]/95 border border-sky-500/40 text-sky-700 dark:text-sky-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#26170E]/90 via-[#26170E]/50 to-transparent p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-2">
                      <span className="text-[#E2BA78]">●</span>
                      <span>{currentView.name}</span>
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider text-[#FAF5EE] bg-[#523522]/90 border border-[#C28E58]/60 px-2 py-0.5 rounded-md">
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

        {/* Chân Hero: Cụm 4 Thẻ Bento Tính Năng Ngang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <div className="bg-white dark:bg-[#20140D]/80 rounded-2xl p-5 border border-[#E0D3C1]/80 dark:border-[#543825] shadow-xs hover:shadow-md hover:border-[#C28E58]/50 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] text-[#523522] dark:text-[#E2BA78] border border-[#E0D3C1] dark:border-[#543825] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#6B442C] dark:text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10"/>
                <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z"/>
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#24170E] dark:text-white">Mô hình FaaS</h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5 leading-relaxed">
                Thuê khay nấm sạch theo chu kỳ chuẩn quốc tế
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#20140D]/80 rounded-2xl p-5 border border-[#E0D3C1]/80 dark:border-[#543825] shadow-xs hover:shadow-md hover:border-[#C28E58]/50 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] text-[#C28E58] border border-[#E0D3C1] dark:border-[#543825] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
                <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#24170E] dark:text-white">Cảm biến IoT Realtime</h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5 leading-relaxed">
                Đo đạc vi khí hậu và cảnh báo tự động qua Socket
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#20140D]/80 rounded-2xl p-5 border border-[#E0D3C1]/80 dark:border-[#543825] shadow-xs hover:shadow-md hover:border-[#C28E58]/50 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] text-[#8C5A37] dark:text-[#DDB988] border border-[#E0D3C1] dark:border-[#543825] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#8C5A37] dark:text-[#DDB988]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 8-6 4 6 4V8Z"/>
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#24170E] dark:text-white">Camera Live Stream</h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5 leading-relaxed">
                Quan sát buồng sạch vô trùng 1080p góc cận
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#20140D]/80 rounded-2xl p-5 border border-[#E0D3C1]/80 dark:border-[#543825] shadow-xs hover:shadow-md hover:border-[#C28E58]/50 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] text-[#523522] dark:text-[#E2BA78] border border-[#E0D3C1] dark:border-[#543825] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#523522] dark:text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#24170E] dark:text-white">Giao Nấm Tận Nhà</h4>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5 leading-relaxed">
                Nghiệm thu cân ký kèm chứng nhận VietGAP
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}