'use client';

import React from 'react';
import { CountUp } from './CountUp';

/**
 * Phần Thống Kê Chỉ Số Vận Hành (Stats Section) chuẩn Cafe Latte Bắc Âu
 * Hiển thị số liệu thực tế đo đạc từ hệ thống CSDL và IoT Farm-as-a-Service
 */
export default function StatsSection() {
  const stats = [
    {
      label: "Khay Nấm Đang Hoạt Động",
      value: 120,
      suffix: "+",
      detail: "Phân bổ trên 6 dàn kệ vô trùng chuẩn ISO Class 5",
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
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-14 bg-gradient-to-b from-[#FDFBF8] via-[#FAF5EE] to-[#FDFBF8] dark:from-[#170E08] dark:via-[#1F140D] dark:to-[#170E08] border-y border-[#E0D3C1]/80 dark:border-[#3D281A] transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/90 dark:bg-[#20140D]/90 border border-[#E0D3C1] dark:border-[#543825] shadow-xs hover:shadow-lg hover:border-[#C28E58] transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#F2E8DC] dark:from-[#2B1C13] dark:to-[#1C120B] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#6B442C] dark:text-[#E2BA78] shadow-xs group-hover:scale-110 transition-transform duration-300 mb-4">
                {s.icon}
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#362113] dark:text-[#FFF5EA] tracking-tight">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              {idx === 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 mt-2">
                  IoT Khép Kín
                </span>
              )}
              {idx === 1 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 mt-2">
                  Chuẩn VietGAP Loại A
                </span>
              )}
              {idx === 2 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 mt-2">
                  WebSocket 5s/lần
                </span>
              )}
              {idx === 3 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 mt-2">
                  T-SQL ROWLOCK
                </span>
              )}
              <h4 className="text-sm font-bold text-[#24170E] dark:text-[#F3E5D4] mt-2">
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
