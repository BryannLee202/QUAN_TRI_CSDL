'use client';

import React from 'react';
import { CountUp } from './CountUp';

/**
 * Phần Thống Kê Chỉ Số Vận Hành (Stats Section)
 * Phối màu kỹ thuật Cleanroom Blueprint - Tách biệt rõ nét với nền Hero phía trên
 */
export default function StatsSection() {
  const stats = [
    {
      label: "Khay Nấm Đang Hoạt Động",
      value: 120,
      suffix: "+",
      detail: "Phân bổ trên 6 dàn kệ vô trùng chuẩn ISO Class 5",
      badge: "IoT Khép Kín",
      badgeClass: "bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/70",
      valueClass: "text-[#6E4423] dark:text-[#F3CE8E]",
      cardBorder: "border-[#DFCFBE] dark:border-[#3E291C] hover:border-[#C28E58]",
      iconBg: "bg-gradient-to-br from-[#FAF5EE] to-[#F2E8DC] dark:from-[#2B1C13] dark:to-[#1C120B] text-[#7A4B27] dark:text-[#E2BA78]",
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
      badgeClass: "bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300/80",
      valueClass: "text-emerald-800 dark:text-emerald-400",
      cardBorder: "border-emerald-200/90 dark:border-emerald-900/60 hover:border-emerald-500",
      iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/60 dark:to-[#170E08] text-emerald-700 dark:text-emerald-400",
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
      badgeClass: "bg-sky-100/90 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-300/80",
      valueClass: "text-sky-800 dark:text-sky-400",
      cardBorder: "border-sky-200/90 dark:border-sky-900/60 hover:border-sky-500",
      iconBg: "bg-gradient-to-br from-sky-50 to-sky-100/60 dark:from-sky-950/60 dark:to-[#170E08] text-sky-700 dark:text-sky-400",
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
      badgeClass: "bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80",
      valueClass: "text-amber-800 dark:text-amber-400",
      cardBorder: "border-amber-200/90 dark:border-amber-900/60 hover:border-amber-500",
      iconBg: "bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/60 dark:to-[#170E08] text-amber-700 dark:text-amber-400",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-[#F4ECE1] dark:bg-[#18100A] border-y border-[#DDCFBE] dark:border-[#382316] transition-colors relative">
      {/* Hairline subtle technical grid texture */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white/95 dark:bg-[#20140D]/95 border ${s.cardBorder} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group`}
            >
              <div className={`w-12 h-12 rounded-2xl ${s.iconBg} border border-[#DECFC0]/60 dark:border-[#422C1D] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300 mb-3.5`}>
                {s.icon}
              </div>
              <div className={`text-3xl md:text-4xl font-black ${s.valueClass} tracking-tight font-sans`}>
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.badgeClass} mt-2.5`}>
                {s.badge}
              </span>
              <h4 className="text-sm font-bold text-[#24170E] dark:text-[#F3E5D4] mt-2.5">
                {s.label}
              </h4>
              <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-1 leading-relaxed">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
