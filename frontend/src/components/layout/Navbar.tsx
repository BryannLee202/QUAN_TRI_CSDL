'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, openAuthModal, isAdmin, isOperator } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-[#FAF5EE] dark:bg-[#25170F] border border-[#DECFC0] dark:border-[#4A3222] text-[#8A5C38] dark:text-[#E2BA78]">
        Customer
      </span>
    );
  };

  return (
    <nav className="bg-white/95 dark:bg-[#140E0A]/95 backdrop-blur-md text-[#24170E] dark:text-[#F7EFE6] px-6 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-[#EAE1D3] dark:border-[#38261A] shadow-xs transition-colors">
      {/* Brand Logo - Cafe Latte Cream Squircle with Deep Coffee Emblem */}
      <Link href="/" className="flex items-center gap-3 group">
        <div 
          className="w-10 h-10 logo-box rounded-2xl bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:via-[#20140D] dark:to-[#170E08] border border-[#D9C8B5] dark:border-[#543825] shadow-xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shrink-0"
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
          className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          {t.nav.customerPortal}
        </Link>
        <a
          href="/#packages"
          className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          Gói Thuê Nấm
        </a>
        <Link
          href="/tinh-loi-nhuan"
          className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition flex items-center gap-1.5"
        >
          <span>Máy Tính Lợi Nhuận</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
            ROI
          </span>
        </Link>
        <Link
          href="/san-nong-san"
          className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          Sàn Nông Sản FaaS
        </Link>
        <Link
          href="/mang-luoi-farm"
          className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition"
        >
          Mạng Lưới Farm
        </Link>
        {(isAdmin || isOperator) && (
          <Link
            href="/operator"
            className="px-3 py-1.5 rounded-xl hover:text-[#3B2212] dark:hover:text-[#FFF5EA] hover:bg-[#F7EFE4] dark:hover:bg-[#281A12] transition flex items-center gap-1.5"
          >
            <span>{t.nav.operatorCenter}</span>
          </Link>
        )}
      </div>

      {/* Right Controls & Authentication Button */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <NotificationBell />
        <LanguageToggle />
        <ThemeToggle />

        {/* Khối Đăng Nhập / Profile User */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#1C120C] border border-[#DECFC0] dark:border-[#38261A] hover:border-[#C28E58] transition shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#6B442C] to-[#C28E58] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] max-w-[110px] truncate leading-tight">
                  {user.fullName}
                </span>
                <span className="mt-0.5">{getRoleBadge(user.role)}</span>
              </div>
              <svg className="w-3.5 h-3.5 text-[#735843] dark:text-[#BFA895] transition-transform group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {/* Menu Thả Xuống (Dropdown) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#4A3222] shadow-2xl p-3 z-50 text-xs animate-fade-in space-y-2">
                <div className="p-2.5 rounded-xl bg-[#FAF5EE] dark:bg-[#22160E] border border-[#E8DCCE] dark:border-[#38261A]">
                  <p className="font-bold text-[#24170E] dark:text-[#FFF5EA] text-sm">{user.fullName}</p>
                  <p className="text-[11px] text-[#735843] dark:text-[#BFA895] truncate mt-0.5">{user.email}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-[#8C6D53]">Vai trò hệ thống:</span>
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/#portal"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#523522] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#281A12] hover:text-[#C28E58] transition"
                  >
                    <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <span>Khay Nấm Của Tôi</span>
                  </Link>

                  {(isAdmin || isOperator) && (
                    <Link
                      href="/operator"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#523522] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#281A12] hover:text-[#C28E58] transition"
                    >
                      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
                      <span>Trung Tâm Điều Hành (Operator)</span>
                    </Link>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F0E6D8] dark:border-[#2D1D13]">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-semibold"
                  >
                    <span>Đăng Xuất Tài Khoản</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#543825] text-xs font-bold hover:bg-[#FAF5EE] dark:hover:bg-[#281A12] text-[#523522] dark:text-[#E2BA78] transition shadow-2xs"
            >
              Đăng Nhập
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 h-8 px-3.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#4A2E1D] via-[#5C3A24] to-[#3B2212] hover:from-[#3D2517] hover:to-[#24140B] shadow-xs transition"
            >
              Đăng Ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
