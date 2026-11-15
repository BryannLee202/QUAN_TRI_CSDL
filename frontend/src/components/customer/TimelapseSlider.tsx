'use client';

import React, { useState } from 'react';

/**
 * TimelapseSlider Component - Thước Tua Lịch Sử Sinh Trưởng Khay Nấm
 * Đồng bộ phong cách Cafe Latte Bắc Âu sang trọng, mô phỏng sinh học từ Ngày 01 đến Ngày 30
 */
export default function TimelapseSlider() {
  const [day, setDay] = useState(15);

  const getStageInfo = (currentDay: number) => {
    if (currentDay < 10) {
      return {
        stageName: 'Giai Đoạn 1: Cấy Giống & Ăn Tơ Vô Trùng',
        statusText: 'Tơ nấm Bào Ngư phân nhánh trắng muốt, phủ kín 95% bề mặt giá thể mùn cưa hữu cơ.',
        progressPercent: Math.round((currentDay / 30) * 100),
        image: '/images/hero-chamber-synced-facility.jpg',
        badge: 'Tơ Nấm Lan Tỏa',
        metrics: 'Độ ẩm: 88% • T: 24.5°C • Tối 90%',
      };
    } else if (currentDay < 22) {
      return {
        stageName: 'Giai Đoạn 2: Kích Ẩm & Hình Thành Quả Thể',
        statusText: 'Các mầm nấm (ghim nấm) nhú đều, bung tán đồng loạt dưới luồng sương siêu âm đối lưu.',
        progressPercent: Math.round((currentDay / 30) * 100),
        image: '/images/hero-chamber-champagne.jpg',
        badge: 'Phát Triển Mũ Nấm',
        metrics: 'Độ ẩm: 92% • T: 23.8°C • CO₂: 620 ppm',
      };
    } else {
      return {
        stageName: 'Giai Đoạn 3: Nấm Trưởng Thành & Chuẩn Bị Thu Hoạch',
        statusText: 'Mũ nấm đạt đường kính 5-7cm, dày dặn, dồi dào dược tính sinh học chuẩn kiểm định VietGAP.',
        progressPercent: Math.round((currentDay / 30) * 100),
        image: '/images/hero-view-mushroom-macro.jpg',
        badge: 'Đạt Chuẩn Thu Hoạch',
        metrics: 'Độ ẩm: 90% • T: 24.0°C • Sẵn Sàng Hái',
      };
    }
  };

  const stage = getStageInfo(day);

  return (
    <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-3xl p-6 shadow-sm border border-[#E0D3C1] dark:border-[#543825] space-y-5 transition-all">
      {/* Tiêu Đề Thước Tua */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#6B442C] dark:text-[#E2BA78]">
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
            <h3 className="font-bold text-base text-[#24170E] dark:text-[#FFF5EA]">
              Thước Tua Timelapse Sinh Trưởng
            </h3>
            <p className="text-xs text-[#735843] dark:text-[#DAC7B5]">
              Ảnh chụp tự động mỗi 12h lưu trữ trên đám mây CSDL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#523522] dark:text-[#E2BA78] bg-[#FAF5EE] dark:bg-[#2B1C13] px-3 py-1.5 rounded-xl border border-[#DECFC0] dark:border-[#422C1D]">
            Ngày Thứ {day} / 30
          </span>
        </div>
      </div>

      {/* Thanh Trượt Slider Điều Khiển Thời Gian */}
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

      {/* Khung Khái Quát Trạng Thái Kèm Ảnh Xem Trước Thực Tế */}
      <div className="bg-[#FAF5EE]/80 dark:bg-[#2B1C13]/60 p-4 rounded-2xl border border-[#DECFC0] dark:border-[#422C1D] flex flex-col sm:flex-row items-center gap-4">
        {/* Ảnh Thumbnail Stage Thực Tế */}
        <div className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden shrink-0 border border-[#DECFC0] dark:border-[#543825] shadow-xs">
          <img
            src={stage.image}
            alt={stage.stageName}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-mono text-[#FFF5EA] px-1.5 py-0.5 rounded">
            D{day}
          </span>
        </div>

        {/* Thông Tin Sinh Trưởng & Chỉ Số Khí Hậu Tương Ứng */}
        <div className="text-xs space-y-1.5 w-full">
          <div className="flex justify-between items-center flex-wrap gap-1">
            <p className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">
              {stage.stageName}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C28E58]/20 text-[#6B442C] dark:text-[#E2BA78] border border-[#C28E58]/30">
              {stage.badge}
            </span>
          </div>
          <p className="text-[#634936] dark:text-[#DAC7B5] leading-relaxed">
            {stage.statusText}
          </p>
          <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-[#8C6D53] dark:text-[#DAC7B5]">
            <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>{stage.metrics}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
