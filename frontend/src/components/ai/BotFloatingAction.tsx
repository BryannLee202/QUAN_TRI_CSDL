'use client';

import React, { useState } from "react";
import MushroomBotDrawer from "./MushroomBotDrawer";

/**
 * Nút Trợ Lý AI MushroomBot - DẠNG HÌNH TRÒN (Circular Floating Action Button)
 * Kích thước tròn chuẩn 56px x 56px, hiệu ứng vòng hào quang tỏa sáng (Aura Pulse)
 * và ánh kim lấp lánh (Shimmer Wave), có tooltip sang trọng khi rê chuột.
 */
export default function BotFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {/* Tooltip hiển thị khi hover sang bên trái nút tròn */}
        <div className="hidden sm:block absolute right-[68px] px-3 py-1.5 rounded-xl bg-[#24170E]/95 dark:bg-[#1A110B]/95 text-[#FAF5EE] text-xs font-bold border border-[#C28E58]/40 shadow-xl shadow-black/30 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <div className="flex items-center gap-1.5">
            <span>MushroomBot AI</span>
            <span className="text-[10px] font-mono text-[#E2BA78] px-1 py-0.2 bg-[#3D2517] rounded">
              Llama-3.1
            </span>
          </div>
        </div>

        {/* Nút bấm DẠNG HÌNH TRÒN HOÀN TOÀN */}
        <button
          id="mushroom-bot-fab"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#1E120A] via-[#2A180E] to-[#3B2213] hover:from-[#2A180E] hover:to-[#4A2B18] text-white border-2 border-[#C28E58] shadow-2xl shadow-[#24170E]/60 hover:shadow-[#C28E58]/40 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          title={isOpen ? "Thu nhỏ (Esc)" : "Hỏi Cố Vấn Nông Nghiệp MushroomBot AI"}
          aria-label={isOpen ? "Thu nhỏ trợ lý AI" : "Mở trợ lý AI hình tròn"}
        >
          {/* 1. Vòng Hào Quang Tĩnh */}
          <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C28E58]/50 via-emerald-500/30 to-[#E2BA78]/50 blur-md opacity-60 group-hover:opacity-100 pointer-events-none transition duration-500"></span>

          {/* 2. Hiệu ứng Ánh Kim Chạy Chéo (Shimmer Sweep) */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <span className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out"></span>
          </span>

          {/* 4. Icon Bên Trong Nút Tròn (Chuyển đổi mượt mà giữa Icon Nấm và Icon Đóng) */}
          <div className="relative w-7 h-7 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {isOpen ? (
              // Icon Đóng (✕) khi đang mở
              <svg className="w-5 h-5 text-[#FAF5EE] transition-transform duration-200 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              // Icon Nấm Mascot khi đang đóng
              <svg className="w-full h-full drop-shadow-md" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="fab-round-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF4E6" />
                    <stop offset="0.5" stopColor="#E2BA78" />
                    <stop offset="1" stopColor="#C28E58" />
                  </linearGradient>
                </defs>
                <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#fab-round-grad)" />
                <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="#24170E" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#fab-round-grad)" />
                <circle cx="34" cy="20" r="3" fill="#24170E" />
              </svg>
            )}
          </div>

          {/* 4. Chấm Xanh Trực Tuyến (Online Status Dot) ở góc trên bên phải hình tròn */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#24170E]"></span>
          </span>
        </button>
      </div>

      <MushroomBotDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
