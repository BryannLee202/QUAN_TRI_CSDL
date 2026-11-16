'use client';

import React from 'react';
import { CountUp } from './CountUp';

/**
 * Phần Thống Kê Chỉ Số Vận Hành (Stats Section)
 * Phương Án 1: Cleanroom Mint & Bio-Emerald (Sinh Học Vô Trùng & Xanh Lục Bảo)
 * Dải màu sáng sủa, thanh nhã, siêu sạch chuẩn ISO / VietGAP, xoá bỏ hoàn toàn cảm giác gãy khúc
 */
export default function StatsSection() {
  const stats = [
    {
      label: "Khay Nấm Đang Hoạt Động",
      value: 120,
      suffix: "+",
      detail: "Phân bổ trên 6 dàn kệ vô trùng chuẩn ISO Class 5",
      badge: "IoT Khép Kín",
      badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      valueClass: "text-emerald-700",
      cardBorder: "border-emerald-100/90 hover:border-emerald-300 shadow-emerald-900/5",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/80",
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
      badgeClass: "bg-teal-100 text-teal-800 border border-teal-200",
      valueClass: "text-teal-700",
      cardBorder: "border-teal-100/90 hover:border-teal-300 shadow-teal-900/5",
      iconBg: "bg-teal-50 text-teal-600 border border-teal-200/80",
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
      badgeClass: "bg-sky-100 text-sky-800 border border-sky-200",
      valueClass: "text-sky-700",
      cardBorder: "border-sky-100/90 hover:border-sky-300 shadow-sky-900/5",
      iconBg: "bg-sky-50 text-sky-600 border border-sky-200/80",
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
      badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
      valueClass: "text-emerald-800",
      cardBorder: "border-amber-100/90 hover:border-amber-300 shadow-amber-900/5",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-200/80",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-14 bg-gradient-to-r from-[#ECFDF5]/80 via-[#F0FDFA]/70 to-[#F0FDF4]/80 border-y border-emerald-100/90 relative overflow-hidden transition-colors">
      {/* Background soft bio mist accents */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-400/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-teal-400/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white/95 border ${s.cardBorder} shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-xs`}
            >
              <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300 mb-3.5`}>
                {s.icon}
              </div>
              <div className={`text-3xl md:text-4xl font-black ${s.valueClass} tracking-tight font-sans`}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.badgeClass} mt-2.5`}>
                {s.badge}
              </span>
              <h4 className="text-sm font-bold text-slate-800 mt-2.5 tracking-wide">
                {s.label}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
