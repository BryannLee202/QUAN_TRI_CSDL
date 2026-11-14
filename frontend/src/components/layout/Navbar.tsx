'use client';

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "../../context/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="bg-white/95 dark:bg-[#140E0A]/95 backdrop-blur-md text-slate-800 dark:text-[#F7EFE6] px-6 py-3.5 flex justify-between items-center sticky top-0 z-50 border-b border-[#EAE1D3] dark:border-[#38261A] shadow-xs transition-colors">
      {/* Brand Logo - Cafe Latte Cream Squircle with Deep Coffee Emblem */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:via-[#20140D] dark:to-[#170E08] border border-[#D9C8B5] dark:border-[#543825] shadow-sm flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shrink-0">
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
          <span className="text-lg font-black tracking-tight text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-1.5">
            MushroomCloud
            <span className="w-2 h-2 rounded-full bg-[#C28E58] animate-pulse"></span>
          </span>
          <span className="text-[10px] font-bold text-[#8A5C38] dark:text-[#D4AF7A] tracking-wider uppercase -mt-0.5">
            Smart Farm FaaS
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-semibold text-[#5C4231] dark:text-[#DAC7B5]">
        <Link
          href="/"
          className="px-3.5 py-2 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.customerPortal}
        </Link>
        <Link
          href="/operator"
          className="px-3.5 py-2 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.operatorCenter}
        </Link>
        <a
          href="#packages"
          className="px-3.5 py-2 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          Gói Thuê Nấm
        </a>
        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.swaggerDocs}
        </a>
      </div>

      {/* Right Controls & CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <NotificationBell />
        <LanguageToggle />
        <ThemeToggle />

        <a
          href="#packages"
          className="hidden lg:inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#523522] hover:bg-[#3D2517] dark:bg-[#C28E58] dark:hover:bg-[#B37F49] dark:text-[#24170E] shadow-sm shadow-[#523522]/20 transition transform active:scale-95"
        >
          Thuê Khay Ngay
        </a>
      </div>
    </nav>
  );
}