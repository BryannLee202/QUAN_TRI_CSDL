'use client';

import React, { useState } from "react";
import MushroomBotDrawer from "./MushroomBotDrawer";

/**
 * Nút Floating Action Button (FAB) trợ lý ảo MushroomBot
 * Phụ trách: Võ Duy Thịnh (thinh20032006@gmail.com)
 */
export default function BotFloatingAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0D5C3A] hover:bg-[#0a462c] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-[#D4AF37]"
          title="Hỏi Trợ Lý MushroomBot AI"
        >
          <span className="text-2xl animate-bounce">🍄</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-bold text-white items-center justify-center">
              AI
            </span>
          </span>

          {/* Tooltip on hover */}
          <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Hỏi Cố Vấn Nông Nghiệp AI
          </span>
        </button>
      </div>

      <MushroomBotDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
