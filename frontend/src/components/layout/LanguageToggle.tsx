'use client';

import React from "react";
import { useLanguage } from "../../context/LanguageContext";

/**
 * Nút chuyển đổi nhanh ngôn ngữ (Tiếng Việt ↔ English)
 * Thiết kế Segmented Pill cao cấp với Vector SVG sắc nét, loại bỏ hoàn toàn Emoji
 */
export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-xl bg-[#F2E8DC]/80 dark:bg-[#27231F] p-1 border border-[#DECFC0] dark:border-[#474039] shadow-inner shrink-0 whitespace-nowrap text-xs">
      {/* Nút Tiếng Việt */}
      <button
        onClick={() => setLanguage("vi")}
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-[11px] font-bold ${
          language === "vi"
            ? "bg-white dark:bg-[#322D28] text-[#361F12] dark:text-[#FFF5EA] shadow-xs"
            : "text-[#8C6E56] dark:text-[#B9ADA1] hover:text-[#361F12] dark:hover:text-[#FFF5EA]"
        }`}
        title="Tiếng Việt"
        aria-label="Chuyển sang Tiếng Việt"
      >
        {/* Vector SVG Quốc kỳ Việt Nam sắc nét */}
        <svg
          className="w-3.5 h-2.5 rounded-[2px] shadow-2xs shrink-0 overflow-hidden"
          viewBox="0 0 14 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="14" height="10" fill="#DA251D" />
          <polygon
            points="7,2 7.9,4.8 10.9,4.8 8.4,6.6 9.4,9.4 7,7.6 4.6,9.4 5.6,6.6 3.1,4.8 6.1,4.8"
            fill="#FFFF00"
          />
        </svg>
        <span className="tracking-wide">VI</span>
      </button>

      {/* Nút English */}
      <button
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-[11px] font-bold ${
          language === "en"
            ? "bg-white dark:bg-[#322D28] text-[#361F12] dark:text-[#FFF5EA] shadow-xs"
            : "text-[#8C6E56] dark:text-[#B9ADA1] hover:text-[#361F12] dark:hover:text-[#FFF5EA]"
        }`}
        title="English"
        aria-label="Switch to English"
      >
        {/* Vector SVG Union Jack Anh Quốc sắc nét */}
        <svg
          className="w-3.5 h-2.5 rounded-[2px] shadow-2xs shrink-0 overflow-hidden"
          viewBox="0 0 14 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="14" height="10" fill="#012169" />
          <path d="M0 0L14 10M14 0L0 10" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M0 0L14 10M14 0L0 10" stroke="#C8102E" strokeWidth="0.9" />
          <path d="M7 0V10M0 5H14" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M7 0V10M0 5H14" stroke="#C8102E" strokeWidth="1.5" />
        </svg>
        <span className="tracking-wide">EN</span>
      </button>
    </div>
  );
}
