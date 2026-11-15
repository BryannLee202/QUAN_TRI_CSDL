'use client';

import React, { useState } from "react";
import MushroomBotDrawer from "./MushroomBotDrawer";

/**
 * Nút Floating Action Button (FAB) trợ lý ảo MushroomBot
 * Thiết kế chuẩn phong cách Nâu Cà Phê Nhạt Trắng & Vàng Caramel Đồng Bộ
 */
export default function BotFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:to-[#170E08] border-2 border-[#C28E58] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          title="Hỏi Cố Vấn Nông Nghiệp AI"
        >
          {/* Logo SVG Icon */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fab-coffee-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4A2E1D" />
                  <stop offset="0.6" stopColor="#6B442C" />
                  <stop offset="1" stopColor="#9E6845" />
                </linearGradient>
                <linearGradient id="fab-bronze-grad" x1="20" y1="20" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C28E58" />
                  <stop offset="1" stopColor="#E2B888" />
                </linearGradient>
              </defs>
              <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#fab-coffee-grad)" />
              <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="url(#fab-bronze-grad)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#fab-coffee-grad)" />
              <circle cx="34" cy="20" r="3" fill="url(#fab-bronze-grad)" />
            </svg>
          </div>

          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C28E58] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#4A2E1D] text-[#E2BA78] items-center justify-center shadow-xs border border-[#C28E58]/40">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
              </svg>
            </span>
          </span>

          {/* Tooltip on hover */}
          <span className="absolute right-16 px-3 py-1.5 bg-[#331E12] text-[#FDF8F2] text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-[#734A2E]">
            Cố Vấn Kỹ Thuật Trực Tuyến
          </span>
        </button>
      </div>

      <MushroomBotDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}