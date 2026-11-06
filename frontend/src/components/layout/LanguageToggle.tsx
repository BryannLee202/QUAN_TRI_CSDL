'use client';

import React from "react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Nút chuyển đổi nhanh ngôn ngữ (🇻🇳 Tiếng Việt ↔ 🇬🇧 English)
 * Phụ trách: Đăng (dang0382482793@gmail.com)
 */
export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 whitespace-nowrap text-xs font-bold">
      <button
        onClick={() => setLanguage("vi")}
        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
          language === "vi"
            ? "bg-white dark:bg-slate-700 text-[#0D5C3A] dark:text-emerald-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
        title="Tiếng Việt"
      >
        <span>🇻🇳</span>
        <span>VI</span>
      </button>

      <button
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
          language === "en"
            ? "bg-white dark:bg-slate-700 text-[#0D5C3A] dark:text-emerald-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
