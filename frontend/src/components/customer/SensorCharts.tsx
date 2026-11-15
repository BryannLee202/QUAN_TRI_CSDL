'use client';

import React from 'react';

/**
 * SensorCharts Component - Biểu Đồ Vi Khí Hậu 24h Realtime
 * Thiết kế SVG Spline Area cao cấp, chuẩn hóa thông số nông học chính xác
 */
export default function SensorCharts() {
  const timeLabels = ['00:00', '06:00', '12:00', '18:00', 'Hiện Tại'];

  return (
    <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E0D3C1] dark:border-[#543825] space-y-6 transition-all">
      {/* Tiêu Đề Mục Cảm Biến */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#6B442C] dark:text-[#E2BA78]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#24170E] dark:text-[#FFF5EA]">
              Biểu Đồ Vi Khí Hậu 24h Realtime
            </h3>
            <p className="text-xs text-[#735843] dark:text-[#DAC7B5]">
              Theo dõi biến thiên nhiệt độ, độ ẩm và nồng độ CO₂ buồng sạch khép kín
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] text-[#523522] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#422C1D] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#C28E58] animate-ping"></span>
            <span>Cập Nhật Mỗi 5 Giây (WebSocket)</span>
          </span>
        </div>
      </div>

      {/* Grid 3 Thẻ Biểu Đồ Cảm Biến */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Nhiệt Độ */}
        <div className="bg-[#FAF5EE]/70 dark:bg-[#1A110A] p-5 rounded-2xl border border-[#DECFC0] dark:border-[#38261A] space-y-3.5 group hover:border-[#C28E58] transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#523522] dark:text-[#E2BA78]">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#C28E58]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                </svg>
              </div>
              <span>Nhiệt Độ Trung Bình</span>
            </div>
            <span className="text-lg font-black text-[#523522] dark:text-[#FFF5EA] font-mono">
              23.8°C
            </span>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="h-24 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C28E58" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#C28E58" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,50 Q40,35 75,45 T150,30 T225,40 T300,25 L300,80 L0,80 Z"
                fill="url(#tempAreaGrad)"
              />
              <path
                d="M0,50 Q40,35 75,45 T150,30 T225,40 T300,25"
                fill="none"
                stroke="#C28E58"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="25" r="4" fill="#C28E58" />
              <circle cx="300" cy="25" r="7" fill="#C28E58" fillOpacity="0.25" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8C6D53] dark:text-[#BFA895] font-mono border-t border-[#DECFC0]/60 dark:border-[#38261A] pt-2">
            <span>Ngưỡng chuẩn: 22 - 25°C</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tối ưu</span>
          </div>
        </div>

        {/* Card 2: Độ Ẩm */}
        <div className="bg-[#FAF5EE]/70 dark:bg-[#1A110A] p-5 rounded-2xl border border-[#DECFC0] dark:border-[#38261A] space-y-3.5 group hover:border-[#5A9E87] transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#523522] dark:text-[#E2BA78]">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#5A9E87]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                </svg>
              </div>
              <span>Độ Ẩm Không Khí</span>
            </div>
            <span className="text-lg font-black text-[#523522] dark:text-[#FFF5EA] font-mono">
              91.5%
            </span>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="h-24 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="humAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5A9E87" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5A9E87" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 Q40,48 75,35 T150,22 T225,28 T300,18 L300,80 L0,80 Z"
                fill="url(#humAreaGrad)"
              />
              <path
                d="M0,40 Q40,48 75,35 T150,22 T225,28 T300,18"
                fill="none"
                stroke="#5A9E87"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="18" r="4" fill="#5A9E87" />
              <circle cx="300" cy="18" r="7" fill="#5A9E87" fillOpacity="0.25" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8C6D53] dark:text-[#BFA895] font-mono border-t border-[#DECFC0]/60 dark:border-[#38261A] pt-2">
            <span>Ngưỡng chuẩn: 88 - 95%</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Siêu âm ON</span>
          </div>
        </div>

        {/* Card 3: Nồng Độ CO2 */}
        <div className="bg-[#FAF5EE]/70 dark:bg-[#1A110A] p-5 rounded-2xl border border-[#DECFC0] dark:border-[#38261A] space-y-3.5 group hover:border-[#8C5A37] transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#523522] dark:text-[#E2BA78]">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#8C5A37]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <span>Nồng Độ Khí CO₂</span>
            </div>
            <span className="text-lg font-black text-[#523522] dark:text-[#FFF5EA] font-mono">
              620 ppm
            </span>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="h-24 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="co2AreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8C5A37" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8C5A37" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,60 Q40,50 75,55 T150,42 T225,48 T300,38 L300,80 L0,80 Z"
                fill="url(#co2AreaGrad)"
              />
              <path
                d="M0,60 Q40,50 75,55 T150,42 T225,48 T300,38"
                fill="none"
                stroke="#8C5A37"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="38" r="4" fill="#8C5A37" />
              <circle cx="300" cy="38" r="7" fill="#8C5A37" fillOpacity="0.25" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8C6D53] dark:text-[#BFA895] font-mono border-t border-[#DECFC0]/60 dark:border-[#38261A] pt-2">
            <span>Ngưỡng chuẩn: &lt; 800 ppm</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Khí tươi đối lưu</span>
          </div>
        </div>
      </div>

      {/* Dải Mốc Thời Gian Trục Hoành 24h */}
      <div className="flex justify-between items-center text-[11px] font-mono text-[#8C6D53] dark:text-[#DAC7B5] px-2 pt-1 border-t border-[#DECFC0]/60 dark:border-[#38261A]">
        {timeLabels.map((lbl, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            <span>{lbl}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
