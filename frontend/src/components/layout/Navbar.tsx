'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import RightControlHub from "./RightControlHub";

export default function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, isOperator } = useAuth();
  const [isControlHubOpen, setIsControlHubOpen] = useState(false);

  const getRoleBadge = (role: string = "") => {
    const r = role.toLowerCase();
    if (r === "admin") {
      return (
        <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-900 dark:text-amber-300">
          Admin
        </span>
      );
    }
    if (r === "operator") {
      return (
        <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-900 dark:text-emerald-300">
          Operator
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] text-[#8A5C38] dark:text-[#E2BA78]">
        Customer
      </span>
    );
  };

  return (
    <>
      <nav className="bg-white/95 dark:bg-[#1E1B18]/95 backdrop-blur-md text-[#24170E] dark:text-[#F7EFE6] px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center sticky top-0 z-40 border-b border-[#EAE1D3] dark:border-[#474039] shadow-xs transition-colors">
        {/* Brand Logo - Cafe Latte Cream Squircle with Deep Coffee Emblem */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div 
            className="w-10 h-10 logo-box rounded-2xl bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:via-[#27231F] dark:to-[#1E1B18] border border-[#D9C8B5] dark:border-[#474039] shadow-xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shrink-0"
            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', flexShrink: 0 }}
          >
            <svg 
              width="28"
              height="28"
              className="w-full h-full logo-svg" 
              style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px', display: 'block' }}
              viewBox="0 0 68 56" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
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
            <span className="text-base sm:text-lg font-black tracking-tight text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-1.5 font-sans whitespace-nowrap">
              MushroomCloud
              <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#8A5C38] dark:text-[#D4AF7A] tracking-wider uppercase -mt-0.5 whitespace-nowrap">
              Smart Farm FaaS
            </span>
          </div>
        </Link>

        {/* Navigation Links - 100% Cùng 1 dòng duy nhất (Single-line whitespace-nowrap) */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-[13.5px] font-semibold text-[#5C4231] dark:text-[#DAC7B5] whitespace-nowrap flex-nowrap">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#3C3630] transition whitespace-nowrap"
          >
            {t.nav.customerPortal}
          </Link>
          <a
            href="/#packages"
            className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#3C3630] transition whitespace-nowrap"
          >
            Gói Thuê Nấm
          </a>
          <Link
            href="/tinh-loi-nhuan"
            className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#3C3630] transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Máy Tính Lợi Nhuận</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
              ROI
            </span>
          </Link>
          <Link
            href="/san-nong-san"
            className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#3C3630] transition whitespace-nowrap"
          >
            Sàn Nông Sản FaaS
          </Link>
          <Link
            href="/mang-luoi-farm"
            className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#3C3630] transition whitespace-nowrap"
          >
            Mạng Lưới Farm
          </Link>
          {(isAdmin || isOperator) && (
            <Link
              href="/operator"
              className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#3C3630] transition flex items-center gap-1.5 whitespace-nowrap text-emerald-800 dark:text-emerald-400 font-bold"
            >
              <span>{t.nav.operatorCenter}</span>
            </Link>
          )}
        </div>

        {/* Right Section: Cụm Kích Hoạt Sidebar Thông Minh & Đăng Nhập Tinh Gọn */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Nút Hồ sơ & Lịch sử giao dịch */}
          <Link
            href="/ho-so"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#474039] text-xs font-bold hover:bg-[#FAF5EE] dark:hover:bg-[#3C3630] text-[#523522] dark:text-[#E2BA78] transition shadow-2xs whitespace-nowrap"
            title="Hồ sơ cá nhân & Lịch sử giao dịch"
          >
            <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Hồ Sơ</span>
          </Link>

          {/* Nút Đăng nhập nhanh nếu chưa đăng nhập */}
          {!isAuthenticated && (
            <Link
              href="/login"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#474039] text-xs font-bold hover:bg-[#FAF5EE] dark:hover:bg-[#3C3630] text-[#523522] dark:text-[#E2BA78] transition shadow-2xs whitespace-nowrap"
            >
              Đăng Nhập
            </Link>
          )}

          {/* Avatar thu nhỏ nếu đã đăng nhập -> Mở Hồ Sơ Cá Nhân */}
          {isAuthenticated && user && (
            <Link
              href="/ho-so"
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-[#FAF5EE] dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58] transition shadow-2xs group"
              title="Xem hồ sơ cá nhân & Lịch sử giao dịch"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6B442C] to-[#C28E58] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] max-w-[90px] truncate leading-tight">
                {user.fullName}
              </span>
              <span className="hidden xl:inline">{getRoleBadge(user.role)}</span>
            </Link>
          )}

          {/* NÚT KÍCH HOẠT RIGHT CONTROL HUB (Sidebar Bên Phải) */}
          <button
            onClick={() => setIsControlHubOpen(true)}
            aria-label="Mở trung tâm điều khiển và tiện ích hệ thống"
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-[#F2E8DC] dark:from-[#24170F] dark:to-[#1E1B18] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58] dark:hover:border-[#C28E58] text-[#5C3A24] dark:text-[#E8DCCE] transition-all duration-200 shadow-2xs group cursor-pointer active:scale-95"
            title="Mở Tiện Ích, Thông Báo & Cài Đặt (Sidebar)"
          >
            {/* Icon Bảng Điều Khiển Squircle 4 Ô */}
            <div className="relative flex items-center justify-center">
              <svg 
                className="w-4 h-4 text-[#735843] dark:text-[#E2BA78] group-hover:text-[#24170E] dark:group-hover:text-white transition-colors" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3" rx="1.5" />
                <rect width="7" height="7" x="14" y="3" rx="1.5" />
                <rect width="7" height="7" x="14" y="14" rx="1.5" />
                <rect width="7" height="7" x="3" y="14" rx="1.5" />
              </svg>
              {/* Chấm Thông Báo Đèn Xanh IoT */}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <span className="hidden md:inline text-xs font-bold text-[#5C3A24] dark:text-[#DAC7B5] group-hover:text-[#24170E] dark:group-hover:text-white transition-colors whitespace-nowrap">
              Tiện Ích &amp; Cài Đặt
            </span>

            {/* Icon Mũi Tên Hướng Vào Phải */}
            <svg 
              className="w-3.5 h-3.5 text-[#8A5C38] dark:text-[#B9ADA1] group-hover:translate-x-0.5 transition-transform" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* THANH SIDEBAR BÊN PHẢI (Right Control Hub Drawer) */}
      <RightControlHub
        isOpen={isControlHubOpen}
        onClose={() => setIsControlHubOpen(false)}
      />
    </>
  );
}
