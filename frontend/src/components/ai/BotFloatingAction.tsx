'use client';

import React, { useState } from "react";
import MushroomBotDrawer from "./MushroomBotDrawer";

/**
 * Nút Floating Action Button (FAB) trợ lý ảo MushroomBot
 * Thiết kế chuẩn phong cách Deep Espresso & Vàng Champagne Đồng Bộ
 */
export default function BotFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-[#24170E] hover:bg-[#382417] text-white border-2 border-[#C28E58] shadow-2xl shadow-[#24170E]/50 hover:shadow-[#C28E58]/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
          title="Hỏi Cố Vấn Nông Nghiệp Thông Minh MushroomBot (Llama-3.1-8B)"
        >
          {/* Logo SVG Icon */}
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-full h-full" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fab-coffee-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F5E6D0" />
                  <stop offset="0.6" stopColor="#E2BA78" />
                  <stop offset="1" stopColor="#C28E58" />
                </linearGradient>
                <linearGradient id="fab-bronze-grad" x1="20" y1="20" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C28E58" />
                  <stop offset="1" stopColor="#E2B888" />
                </linearGradient>
              </defs>
              <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#fab-coffee-grad)" />
              <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="#24170E" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#fab-coffee-grad)" />
              <circle cx="34" cy="20" r="3" fill="#24170E" />
            </svg>
          </div>

          {/* Text Label: Rõ Ràng & Chuyên Nghiệp */}
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide text-[#FAF5EE]">MushroomBot AI</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <span className="text-[10px] text-[#E2BA78] font-mono font-medium block">Llama-3.1-8B FaaS</span>
          </div>

          {/* Sparkle Badge */}
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C28E58] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-[#3D2517] text-[#E2BA78] items-center justify-center shadow-xs border border-[#C28E58]">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
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