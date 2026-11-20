'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import MushroomBotDrawer from '../ai/MushroomBotDrawer';

interface RightControlHubProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  type: 'alert' | 'success' | 'info';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Cảnh Báo Vi Khí Hậu Buồng B-02',
    desc: 'Nhiệt độ đạt ngưỡng 24.5°C. Rèm lạnh đối lưu tự động vận hành.',
    time: '2 phút trước',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'success',
    title: 'Hợp Đồng Thuê Khay TRAY-04 Đã Khóa',
    desc: 'Giao dịch Serialized thành công trên CSDL SmartMushroomDB.',
    time: '15 phút trước',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'Nhắc Nhở Chu Kỳ Thu Hoạch',
    desc: 'Khay Đông Trùng Hạ Thảo của bạn đã sẵn sàng cắt nấm đợt 1.',
    time: '1 giờ trước',
    read: false,
  },
];

export default function RightControlHub({ isOpen, onClose }: RightControlHubProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout, isAdmin, isOperator } = useAuth();

  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('mushroomcloud_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
  }, []);

  // Đóng khi nhấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi mở sidebar
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleTheme = (targetDark: boolean) => {
    setIsDark(targetDark);
    if (targetDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mushroomcloud_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mushroomcloud_theme', 'light');
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getRoleBadge = (role: string = '') => {
    const r = role.toLowerCase();
    if (r === 'admin') {
      return (
        <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-900 dark:text-amber-300">
          Admin
        </span>
      );
    }
    if (r === 'operator') {
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
    <>
      {/* Lớp nền mờ (Backdrop overlay) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Thanh Sidebar Trượt Từ Phải Sang (Drawer) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-[#FDFBF8] dark:bg-[#150E0A] text-[#24170E] dark:text-[#F7EFE6] border-l border-[#DECFC0] dark:border-[#38261A] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Trung tâm điều khiển và tiện ích"
      >
        {/* Header của Sidebar */}
        <div className="p-4 sm:p-5 border-b border-[#EAE1D3] dark:border-[#2D1B11] flex items-center justify-between bg-white/60 dark:bg-[#1A110C]/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6B442C] to-[#C28E58] flex items-center justify-center text-white shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[#24170E] dark:text-[#FFF5EA]">
                Trung Tâm Điều Khiển FaaS
              </h2>
              <p className="text-[10px] text-[#8A5C38] dark:text-[#C28E58] font-semibold uppercase tracking-wider">
                Cài Đặt, Tiện Ích &amp; Thông Báo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF5EE] dark:bg-[#22160E] hover:bg-[#F2E8DC] dark:hover:bg-[#2D1C12] border border-[#DECFC0] dark:border-[#38261A] text-[#735843] dark:text-[#DAC7B5] hover:text-[#24170E] dark:hover:text-white flex items-center justify-center transition shadow-2xs"
            title="Đóng sidebar (Esc)"
            aria-label="Đóng"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nội dung cuộn chính của Sidebar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">

          {/* KHỐI 1: TÀI KHOẢN & ĐỊNH DANH NGƯỜI DÙNG */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#1C120C] border border-[#EAE1D3] dark:border-[#332015] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#6E4B33] dark:text-[#D4AF7A]">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Tài Khoản Thành Viên
              </span>
              {isAuthenticated && user && getRoleBadge(user.role)}
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#24170F] border border-[#DECFC0] dark:border-[#38261A]">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6B442C] via-[#8C5A37] to-[#C28E58] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA] truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-[#8A5C38] dark:text-[#BFA895] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/ho-so"
                    onClick={onClose}
                    className="col-span-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#24170E] to-[#3B2415] hover:from-[#382417] hover:to-[#523522] text-white font-bold text-xs text-center border border-[#C28E58]/40 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>Hồ Sơ &amp; Lịch Sử Giao Dịch</span>
                  </Link>
                  {(isAdmin || isOperator) && (
                    <Link
                      href="/operator"
                      onClick={onClose}
                      className="col-span-2 py-2 px-3 rounded-xl bg-[#FAF5EE] dark:bg-[#24170F] hover:border-[#C28E58] text-[#24170E] dark:text-[#E2BA78] font-bold text-xs text-center border border-[#DECFC0] dark:border-[#38261A] transition flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                      <span>Vào Trung Tâm Điều Hành</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="col-span-2 py-2 px-3 rounded-xl bg-[#FAF5EE] hover:bg-rose-50 dark:bg-[#22160E] dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-[#DECFC0] dark:border-[#38261A] font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Đăng Xuất Khỏi Hệ Thống</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-[#735843] dark:text-[#DAC7B5] leading-relaxed">
                  Đăng nhập để giám sát khay nấm từ xa, theo dõi luồng camera trực tiếp và nhận thông báo thu hoạch chuẩn VietGAP.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#24170F] hover:bg-[#FAF5EE] dark:hover:bg-[#2E1D13] text-[#4A3222] dark:text-[#FFF5EA] border border-[#DECFC0] dark:border-[#422C1D] font-bold text-xs text-center transition shadow-2xs flex items-center justify-center"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl bg-[#24170E] hover:bg-[#382417] text-white font-bold text-xs text-center border border-[#C28E58]/35 transition shadow-sm shadow-[#24170E]/20 flex items-center justify-center gap-1"
                  >
                    <span>Tạo Tài Khoản</span>
                    <span className="text-[#E2BA78] font-bold">→</span>
                  </Link>
                  <Link
                    href="/ho-so"
                    onClick={onClose}
                    className="col-span-2 py-2.5 px-3 rounded-xl bg-[#FAF5EE] dark:bg-[#24170F] hover:border-[#C28E58] text-[#4A3222] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#422C1D] font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>Xem Hồ Sơ &amp; Lịch Sử Giao Dịch</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* KHỐI TRỢ LÝ AI: MUSHROOMBOT (LLAMA-3.1-8B FAAS ENGINE) */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#FAF5EE] via-[#F4ECE1] to-[#EAE0D3] dark:from-[#25170F] dark:via-[#1E120A] dark:to-[#170E08] border border-[#DECFC0] dark:border-[#422C1D] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6B442C] to-[#C28E58] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  🍄
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-1.5">
                    <span>MushroomBot AI</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                      Llama-3.1-8B
                    </span>
                  </h4>
                  <p className="text-[10px] text-[#735843] dark:text-[#DAC7B5]">
                    Cố vấn vi khí hậu &amp; hợp đồng VietGAP 24/7
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAiChatOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2B1B11] to-[#3B2517] hover:from-[#1C1109] hover:to-[#2B1B11] text-[#E2BA78] hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs border border-[#C28E58]/30 active:scale-98"
            >
              <span>Trò Chuyện Với Cố Vấn AI</span>
              <span>→</span>
            </button>
          </div>

          {/* KHỐI 2: TÙY CHỌN GIAO DIỆN & NGÔN NGỮ (PREFERENCES) */}
          <div className="rounded-2xl p-4 bg-white dark:bg-[#1C120C] border border-[#EAE1D3] dark:border-[#332015] shadow-xs space-y-4">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold text-[#6E4B33] dark:text-[#D4AF7A]">
              <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Tùy Chọn Hệ Thống
            </span>

            {/* Chuyển đổi Theme Sáng / Tối */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5C4231] dark:text-[#DAC7B5]">
                <span>Chế độ hiển thị:</span>
                <span className="text-[11px] font-mono text-[#8A5C38] dark:text-[#C28E58]">
                  {isDark ? 'Ban Đêm (Dark)' : 'Ban Ngày (Light)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#FAF5EE] dark:bg-[#25170F] border border-[#DECFC0] dark:border-[#38261A]">
                <button
                  type="button"
                  onClick={() => toggleTheme(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    !isDark
                      ? 'bg-white text-[#24170E] shadow-xs border border-[#DECFC0]'
                      : 'text-[#8A5C38] dark:text-[#A88C76] hover:text-[#24170E]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>Giao Diện Sáng</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleTheme(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-[#331E12] text-[#FFF5EA] shadow-xs border border-[#543825]'
                      : 'text-[#8A5C38] dark:text-[#A88C76] hover:text-[#24170E]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Giao Diện Tối</span>
                </button>
              </div>
            </div>

            {/* Chuyển đổi Ngôn Ngữ */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5C4231] dark:text-[#DAC7B5]">
                <span>Ngôn ngữ hiển thị:</span>
                <span className="text-[11px] font-mono text-[#8A5C38] dark:text-[#C28E58]">
                  {language === 'vi' ? 'Tiếng Việt' : 'English'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#FAF5EE] dark:bg-[#25170F] border border-[#DECFC0] dark:border-[#38261A]">
                <button
                  type="button"
                  onClick={() => setLanguage('vi')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    language === 'vi'
                      ? 'bg-white dark:bg-[#331E12] text-[#24170E] dark:text-[#FFF5EA] shadow-xs border border-[#DECFC0] dark:border-[#543825]'
                      : 'text-[#8A5C38] dark:text-[#A88C76] hover:text-[#24170E]'
                  }`}
                >
                  <svg className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0 overflow-hidden" viewBox="0 0 14 10" fill="none">
                    <rect width="14" height="10" fill="#DA251D" />
                    <polygon points="7,2 7.9,4.8 10.9,4.8 8.4,6.6 9.4,9.4 7,7.6 4.6,9.4 5.6,6.6 3.1,4.8 6.1,4.8" fill="#FFFF00" />
                  </svg>
                  <span>Tiếng Việt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                    language === 'en'
                      ? 'bg-white dark:bg-[#331E12] text-[#24170E] dark:text-[#FFF5EA] shadow-xs border border-[#DECFC0] dark:border-[#543825]'
                      : 'text-[#8A5C38] dark:text-[#A88C76] hover:text-[#24170E]'
                  }`}
                >
                  <svg className="w-4 h-3 rounded-[2px] shadow-2xs shrink-0 overflow-hidden" viewBox="0 0 60 30" fill="none">
                    <clipPath id="sbar-uk"><rect width="60" height="30"/></clipPath>
                    <g clipPath="url(#sbar-uk)">
                      <rect width="60" height="30" fill="#012169"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                    </g>
                  </svg>
                  <span>English</span>
                </button>
              </div>
            </div>
          </div>

          {/* KHỐI 3: THÔNG BÁO IOT & NÔNG TRẠI REALTIME */}
          <div className="rounded-2xl p-4 sm:p-4.5 bg-white dark:bg-[#1C120C] border border-[#EAE1D3] dark:border-[#332015] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] dark:border-[#2D1B11] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#C28E58]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                  Thông Báo Vi Khí Hậu &amp; Nông Trại
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-xs">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-[#8C6D53] hover:text-[#C28E58] dark:text-[#BFA895] dark:hover:text-white transition"
                >
                  Đọc tất cả
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => {
                const isAlert = n.type === 'alert';
                const isSuccess = n.type === 'success';

                return (
                  <div
                    key={n.id}
                    onClick={() => markSingleAsRead(n.id)}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                      n.read
                        ? 'bg-[#FAF5EE]/40 dark:bg-[#20140D]/40 border-transparent text-[#735843] dark:text-[#A88C76] opacity-75'
                        : 'bg-[#FAF5EE] dark:bg-[#24170F] border-[#DECFC0] dark:border-[#38261A] text-[#24170E] dark:text-[#FFF5EA] shadow-2xs hover:border-[#C28E58]'
                    }`}
                  >
                    {/* Icon Tile Đại Diện Chuyên Biệt */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                        isAlert
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400'
                          : isSuccess
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60 text-[#C28E58] dark:text-[#E2BA78]'
                      }`}
                    >
                      {isAlert && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                        </svg>
                      )}
                      {isSuccess && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      )}
                      {!isAlert && !isSuccess && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#8C6D53] dark:text-[#A88C76] shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#634936] dark:text-[#DAC7B5] mt-0.5 leading-relaxed">
                        {n.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KHỐI 4: HỖ TRỢ KỸ THUẬT & TIÊU CHUẨN NÔNG NGHIỆP */}
          <div className="rounded-2xl p-4 sm:p-4.5 bg-white dark:bg-[#1C120C] border border-[#EAE1D3] dark:border-[#332015] shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-[#F2E8DC] dark:border-[#2D1B11] pb-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#C28E58]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                Hỗ Trợ Kỹ Thuật &amp; Tiêu Chuẩn Nông Nghiệp
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Dòng Hotline Kỹ Thuật Viên */}
              <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#24170F] border border-[#DECFC0] dark:border-[#38261A] flex items-center justify-between gap-3 shadow-2xs hover:border-[#C28E58] transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#24170E] dark:text-[#FFF5EA] leading-tight">
                      Hotline Kỹ Thuật 24/7
                    </p>
                    <p className="text-[10px] text-[#8C6D53] dark:text-[#BFA895] mt-0.5">
                      Điều phối vi khí hậu &amp; sự cố buồng nuôi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300">
                    1900 8888
                  </span>
                </div>
              </div>

              {/* Dòng Tiêu Chuẩn Kiểm Nghiệm */}
              <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#24170F] border border-[#DECFC0] dark:border-[#38261A] flex items-center justify-between gap-3 shadow-2xs hover:border-[#C28E58] transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-[#C28E58] dark:text-[#E2BA78] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#24170E] dark:text-[#FFF5EA] leading-tight">
                      Chứng Nhận &amp; Kiểm Định
                    </p>
                    <p className="text-[10px] text-[#8C6D53] dark:text-[#BFA895] mt-0.5">
                      Môi trường phòng cấy &amp; dược tính nấm
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E130B] border border-[#DECFC0] dark:border-[#422C1D] font-bold text-[11px] text-[#523522] dark:text-[#E2BA78] shadow-2xs shrink-0">
                  VietGAP &amp; ISO Class 5
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer của Sidebar */}
        <div className="p-3.5 border-t border-[#EAE1D3] dark:border-[#2D1B11] bg-white/60 dark:bg-[#1A110C]/60 text-center shrink-0">
          <p className="text-[11px] text-[#8C6D53] dark:text-[#A88C76]">
            MushroomCloud Smart Farm • Phiên bản 2.5
          </p>
        </div>
      </aside>

      {/* Trợ Lý AI MushroomBot Drawer (Llama-3.1-8B) */}
      <MushroomBotDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />
    </>
  );
}
