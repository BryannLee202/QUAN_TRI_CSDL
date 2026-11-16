'use client';

import React from 'react';
import { CountUp } from './CountUp';

/**
 * Phần Thống Kê Chỉ Số Vận Hành (Stats Section)
 * Midnight Telemetry Band phong cách SEAL_HACKATHON
 * Dải màu tối sâu huyền bí phá vỡ sự đơn điệu, các chỉ số phát sáng đa sắc rực rỡ
 */
export default function StatsSection() {
  const stats = [
    {
      label: "Khay Nấm Đang Hoạt Động",
      value: 120,
      suffix: "+",
      detail: "Phân bổ trên 6 dàn kệ vô trùng chuẩn ISO Class 5",
      badge: "IoT Khép Kín",
      badgeClass: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
      valueClass: "text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]",
      cardBorder: "border-amber-500/30 hover:border-amber-400/80 shadow-amber-950/20",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h18M3 12h18M3 17h18" />
          <path d="M5 4v16M19 4v16" />
          <circle cx="10" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="14" cy="14.5" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "Chuẩn VietGAP Loại A",
      value: 99,
      suffix: "%",
      detail: "Kiểm nghiệm nghiêm ngặt hoạt chất sinh học & độ ẩm",
      badge: "Chuẩn VietGAP Loại A",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
      valueClass: "text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]",
      cardBorder: "border-emerald-500/30 hover:border-emerald-400/80 shadow-emerald-950/20",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      label: "Bản Tin Vi Khí Hậu / Giờ",
      value: 85000,
      suffix: "+",
      detail: "Cập nhật cảm biến 5s/lần qua giao thức WebSocket",
      badge: "WebSocket 5s/lần",
      badgeClass: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
      valueClass: "text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]",
      cardBorder: "border-sky-500/30 hover:border-sky-400/80 shadow-sky-950/20",
      iconBg: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
          <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
        </svg>
      ),
    },
    {
      label: "Độ Trễ Khóa Dòng T-SQL",
      value: 4,
      suffix: " ms",
      detail: "Khóa dòng ROWLOCK Serializable tức thời trên CSDL",
      badge: "T-SQL ROWLOCK",
      badgeClass: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
      valueClass: "text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.35)]",
      cardBorder: "border-orange-500/30 hover:border-orange-400/80 shadow-orange-950/20",
      iconBg: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-[#0B0F14] text-white border-y border-[#1E293B] relative overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-[#121820]/90 border ${s.cardBorder} shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-xs`}
            >
              <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300 mb-3.5`}>
                {s.icon}
              </div>
              <div className={`text-3xl md:text-4xl font-black ${s.valueClass} tracking-tight font-sans`}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.badgeClass} mt-2.5`}>
                {s.badge}
              </span>
              <h4 className="text-sm font-bold text-white mt-2.5 tracking-wide">
                {s.label}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
