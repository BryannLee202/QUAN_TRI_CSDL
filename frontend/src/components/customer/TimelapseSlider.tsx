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
        image: '/images/hero-chamber-warm-champagne.jpg',
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
    <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-100 flex flex-col justify-between space-y-5 transition-all h-full">
      {/* Tiêu Đề Thước Tua */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-emerald-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
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
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              Thước Tua Timelapse Sinh Trưởng
            </h3>
            <p className="text-xs text-slate-500">
              Ảnh chụp tự động mỗi 12h lưu trữ trên đám mây CSDL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
            Ngày Thứ {day} / 30
          </span>
        </div>
      </div>

      {/* Ảnh Xem Trước Trạng Thái Sinh Học Thực Tế */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-emerald-100 shadow-xs group">
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
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xs">
            {stage.badge}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="font-bold text-sm text-[#FFF5EA] drop-shadow-xs">
            {stage.stageName}
          </p>
          <p className="text-xs text-[#DAC7B5] line-clamp-1 mt-0.5 drop-shadow-xs">
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
          className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 border border-slate-200"
        />
        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Ngày 01 (Gieo Mầm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Ngày 15 (Lớn Nhanh)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Ngày 30 (Thu Hoạch)
          </span>
        </div>
      </div>

      {/* Thông Số Môi Trường Tương Ứng Với Ngày Chọn */}
      <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2 font-medium">
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Vi khí hậu mốc D{day}: <strong className="text-slate-900">{stage.metrics}</strong></span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
          Sync CSDL OK
        </span>
      </div>
    </div>
  );
}
