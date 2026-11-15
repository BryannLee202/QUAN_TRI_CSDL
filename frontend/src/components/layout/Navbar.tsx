'use client';

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "../../context/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="bg-white/95 dark:bg-[#140E0A]/95 backdrop-blur-md text-[#24170E] dark:text-[#F7EFE6] px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-[#EAE1D3] dark:border-[#38261A] shadow-xs transition-colors">
      {/* Brand Logo - Cafe Latte Cream Squircle with Deep Coffee Emblem */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:via-[#20140D] dark:to-[#170E08] border border-[#D9C8B5] dark:border-[#543825] shadow-xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shrink-0">
          <svg className="w-full h-full" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nav-coffee-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4A2E1D" />
                <stop offset="0.6" stopColor="#6B442C" />
                <stop offset="1" stopColor="#9E6845" />
              </linearGradient>
              <linearGradient id="nav-bronze-grad" x1="20" y1="20" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C28E58" />
                <stop offset="1" stopColor="#E2B888" />
              </linearGradient>
            </defs>
            <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#nav-coffee-grad)" />
            <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="url(#nav-bronze-grad)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#nav-coffee-grad)" />
            <circle cx="34" cy="20" r="3" fill="url(#nav-bronze-grad)" />
            <circle cx="23" cy="22" r="2" fill="#C28E58" />
            <circle cx="45" cy="22" r="2" fill="#C28E58" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-1.5 font-sans">
            MushroomCloud
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
          </span>
          <span className="text-[10px] font-bold text-[#8A5C38] dark:text-[#D4AF7A] tracking-wider uppercase -mt-0.5">
            Smart Farm FaaS
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-[13px] font-semibold text-[#5C4231] dark:text-[#DAC7B5]">
        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.customerPortal}
        </Link>
        <Link
          href="/operator"
          className="px-3.5 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.operatorCenter}
        </Link>
        <a
          href="#packages"
          className="px-3.5 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          Gói Thuê Nấm
        </a>
        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.swaggerDocs}
        </a>
      </div>

      {/* Right Controls & Real Crafted Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <NotificationBell />
        <LanguageToggle />
        <ThemeToggle />

        <a
          href="#packages"
          className="hidden lg:inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#4A2E1D] via-[#5C3A24] to-[#3B2212] hover:from-[#3D2517] hover:to-[#24140B] dark:from-[#C28E58] dark:to-[#9E6845] dark:text-[#170E08] shadow-sm shadow-[#4A2E1D]/20 hover:shadow-md transition-all duration-200 transform active:scale-95 group border border-[#6B442C]/40"
        >
          <span>Thuê Khay Ngay</span>
          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.333 8h9.334M8.667 4l4 4-4 4" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
