'use client';

import React from 'react';
import { CountUp } from './CountUp';

/**
 * Phần Thống Kê Chỉ Số Động (Stats Section) sử dụng CountUp
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
    <section className="py-12 bg-[#093823] dark:bg-slate-950 text-white border-y border-emerald-800 dark:border-slate-800 shadow-inner transition-colors">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, idx) => (
          <div key={idx} className="space-y-1.5 p-3 rounded-2xl hover:bg-white/5 transition">
            <span className="text-2xl md:text-3xl block">{s.icon}</span>
            <div className="text-3xl md:text-4xl font-extrabold text-[#D4AF37] tracking-tight">
              <CountUp target={s.value} suffix={s.suffix} />
            </div>
            <p className="text-xs md:text-sm text-emerald-200 dark:text-slate-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
