'use client';

import React, { useState } from "react";
import MushroomBotDrawer from "./MushroomBotDrawer";

/**
 * Nút Floating Action Button (FAB) Trợ lý AI MushroomBot
 * Thiết kế siêu gọn, hiệu ứng hào quang kép (Aura Pulse) và ánh kim (Shimmer)
 * Chuẩn màu Deep Espresso & Vàng Champagne
 */
export default function BotFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center">
        <button
          id="mushroom-bot-fab"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#24170E] hover:bg-[#342013] text-white border border-[#C28E58]/70 shadow-xl shadow-[#24170E]/40 hover:shadow-[#C28E58]/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          title={isOpen ? "Thu nhỏ trợ lý AI (Esc)" : "Mở Trợ Lý Nông Nghiệp Thông Minh MushroomBot (Llama-3.1-8B)"}
          aria-label={isOpen ? "Đóng hộp thoại AI" : "Mở hộp thoại AI"}
        >
          {/* 1. Hiệu ứng Hào Quang Kép (Dual Ambient Aura Pulse Ring) */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#C28E58]/40 via-emerald-500/30 to-[#C28E58]/40 blur-md opacity-60 group-hover:opacity-100 animate-pulse pointer-events-none transition duration-500"></span>

          {/* 2. Hiệu ứng Ánh Kim Lướt Qua (Shimmer Sweep) */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <span className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out"></span>
          </span>

          {/* 3. Icon Nấm 3D Nhỏ Gọn */}
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <svg className="w-full h-full drop-shadow-xs" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fab-compact-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F5E6D0" />
                  <stop offset="0.6" stopColor="#E2BA78" />
                  <stop offset="1" stopColor="#C28E58" />
                </linearGradient>
              </defs>
              <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#fab-compact-grad)" />
              <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="#24170E" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#fab-compact-grad)" />
              <circle cx="34" cy="20" r="3" fill="#24170E" />
            </svg>
          </div>

          {/* 4. Text Label Gọn Gàng */}
          <div className="flex items-center gap-1.5 pr-0.5">
            <span className="text-xs font-bold tracking-tight text-[#FAF5EE]">
              {isOpen ? "Thu nhỏ" : "MushroomBot"}
            </span>

            {/* Chấm tròn trạng thái hoạt động */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </div>

          {/* 5. Mini Sparkle Star Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C28E58] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#3D2517] text-[#E2BA78] items-center justify-center shadow-xs border border-[#C28E58]/80">
              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
              </svg>
            </span>
          </span>
        </button>
      </div>

      <MushroomBotDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
