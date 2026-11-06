'use client';

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "../../context/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
          🍄
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            MushroomCloud
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase -mt-0.5">
            Smart Farm FaaS
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <Link
          href="/"
          className="px-3.5 py-2 rounded-xl hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition"
        >
          {t.nav.customerPortal}
        </Link>
        <Link
          href="/operator"
          className="px-3.5 py-2 rounded-xl hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition"
        >
          {t.nav.operatorCenter}
        </Link>
        <a
          href="#packages"
          className="px-3.5 py-2 rounded-xl hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition"
        >
          Gói Thuê Nấm
        </a>
        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition"
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
          className="hidden lg:inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-700/20 transition transform active:scale-95"
        >
          Thuê Khay Ngay
        </a>
      </div>
    </nav>
  );
}
