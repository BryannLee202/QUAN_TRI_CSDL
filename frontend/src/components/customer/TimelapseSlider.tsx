'use client';

import React, { useState } from 'react';

/**
 * TimelapseSlider Component - Thước Tua Lịch Sử Sinh Trưởng Khay Nấm
 * Thiết kế cân đối cột phải bên cạnh CameraFeed, phong cách Cafe Latte Bắc Âu sang trọng
 */
export default function TimelapseSlider() {
  const [day, setDay] = useState(15);

  const getStageInfo = (currentDay: number) => {
    if (currentDay < 10) {
      return {
        stageName: 'Giai Đoạn 1: Cấy Giống & Ăn Tơ Vô Trùng',
        statusText: 'Tơ nấm Bào Ngư phân nhánh trắng muốt, phủ kín 95% bề mặt giá thể mùn cưa hữu cơ.',
        image: '/images/hero-chamber-synced-facility.jpg',
        badge: 'Tơ Nấm Lan Tỏa',
        metrics: 'Độ ẩm: 88% • T: 24.5°C • Tối 90%',
      };
    } else if (currentDay < 22) {
      return {
        stageName: 'Giai Đoạn 2: Kích Ẩm & Hình Thành Quả Thể',
        statusText: 'Các mầm nấm (ghim nấm) nhú đều, bung tán đồng loạt dưới luồng sương siêu âm đối lưu.',
        image: '/images/hero-chamber-fullbleed-white.jpg',
        badge: 'Phát Triển Mũ Nấm',
        metrics: 'Độ ẩm: 92% • T: 23.8°C • CO₂: 620 ppm',
      };
    } else {
      return {
        stageName: 'Giai Đoạn 3: Nấm Trưởng Thành & Đạt Tiêu Chuẩn',
        statusText: 'Mũ nấm đạt đường kính 5-7cm, dày dặn, dồi dào dược tính sinh học chuẩn kiểm định VietGAP.',
        image: '/images/hero-view-mushroom-macro.jpg',
        badge: 'Đạt Chuẩn Thu Hoạch',
        metrics: 'Độ ẩm: 90% • T: 24.0°C • Sẵn Sàng Hái',
      };
    }
  };

  const stage = getStageInfo(day);

  return (
    <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E0D3C1] dark:border-[#543825] flex flex-col justify-between space-y-5 transition-all h-full">
      {/* Tiêu Đề Thước Tua */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#EAE1D3] dark:border-[#362114] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#6B442C] dark:text-[#E2BA78] shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
              <line x1="7" x2="7" y1="2" y2="22" />
              <line x1="17" x2="17" y1="2" y2="22" />
              <line x1="2" x2="22" y1="12" y2="12" />
              <line x1="2" x2="7" y1="7" y2="7" />
              <line x1="2" x2="7" y1="17" y2="17" />
              <line x1="17" x2="22" y1="7" y2="7" />
              <line x1="17" x2="22" y1="17" y2="17" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#24170E] dark:text-[#FFF5EA]">
              Thước Tua Timelapse Sinh Trưởng
            </h3>
            <p className="text-xs text-[#735843] dark:text-[#DAC7B5]">
              Ảnh chụp tự động mỗi 12h lưu trữ trên đám mây CSDL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#523522] dark:text-[#E2BA78] bg-[#FAF5EE] dark:bg-[#2B1C13] px-3.5 py-1.5 rounded-xl border border-[#DECFC0] dark:border-[#422C1D]">
            Ngày Thứ {day} / 30
          </span>
        </div>
      </div>

      {/* Ảnh Xem Trước Trạng Thái Sinh Học Thực Tế */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#DECFC0] dark:border-[#422C1D] shadow-sm group">
        <img
          src={stage.image}
          alt={stage.stageName}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>

        {/* Badge Nổi Trên Ảnh */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-black/60 backdrop-blur-md text-[11px] font-mono text-[#FFF5EA] px-2.5 py-1 rounded-lg border border-white/10">
            MỐC NGÀY: D{day < 10 ? `0${day}` : day}
          </span>
          <span className="bg-[#C28E58] text-[#1C120C] text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
            {stage.badge}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="font-bold text-sm text-[#FFF5EA] drop-shadow-sm">
            {stage.stageName}
          </p>
          <p className="text-xs text-[#DAC7B5] line-clamp-1 mt-0.5 drop-shadow-sm">
            {stage.statusText}
          </p>
        </div>
      </div>

      {/* Thanh Trượt Slider Điều Khiển Ngày */}
      <div className="space-y-2 pt-1">
        <input
          type="range"
          min="1"
          max="30"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="w-full h-2.5 bg-[#FAF5EE] dark:bg-[#2B1C13] rounded-lg appearance-none cursor-pointer accent-[#C28E58] border border-[#DECFC0] dark:border-[#422C1D]"
        />
        <div className="flex justify-between text-[11px] font-semibold text-[#8C6D53] dark:text-[#DAC7B5]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            Ngày 01 (Gieo Mầm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            Ngày 15 (Lớn Nhanh)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            Ngày 30 (Thu Hoạch)
          </span>
        </div>
      </div>

      {/* Thông Số Môi Trường Tương Ứng Với Ngày Chọn */}
      <div className="bg-[#FAF5EE]/90 dark:bg-[#2B1C13]/60 p-3.5 rounded-2xl border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-between text-xs text-[#523522] dark:text-[#DAC7B5]">
        <div className="flex items-center gap-2 font-medium">
          <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Vi khí hậu mốc D{day}: <strong>{stage.metrics}</strong></span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          Sync CSDL OK
        </span>
      </div>
    </div>
  );
}
