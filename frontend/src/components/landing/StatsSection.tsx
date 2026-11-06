'use client';

import React from 'react';
import { CountUp } from './CountUp';

/**
 * Phần Thống Kê Chỉ Số Động (Stats Section) phong cách Scandinavian Clean White
 * Phụ trách: Võ Duy Thịnh
 */
export default function StatsSection() {
  const stats = [
    { label: "Khay nấm đang nuôi trồng", value: 120, suffix: "+", icon: "🍄" },
    { label: "Tỉ lệ nấm đạt chuẩn Loại A", value: 99, suffix: "%", icon: "⭐" },
    { label: "Bản tin cảm biến IoT đã xử lý", value: 85000, suffix: "+", icon: "📡" },
    { label: "Độ trễ phản hồi Trigger T-SQL", value: 4, suffix: " ms", icon: "⚡" },
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300"
          >
            <span className="text-2xl md:text-3xl block mb-2">{s.icon}</span>
            <div className="text-3xl md:text-4xl font-black text-[#0D5C3A] dark:text-emerald-400 tracking-tight">
              <CountUp target={s.value} suffix={s.suffix} />
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
