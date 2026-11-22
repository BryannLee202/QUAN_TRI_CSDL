'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppNotification,
  navigateToNotificationDestination,
  useAppNotifications,
} from '../../utils/notificationRouter';

export default function NotificationBell() {
  const router = useRouter();
  const { isAdmin, isOperator } = useAuth();
  const isStaff = Boolean(isAdmin || isOperator);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markItemAsRead, markAllAsRead } =
    useAppNotifications(isStaff);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: AppNotification) => {
    markItemAsRead(n.id);
    navigateToNotificationDestination(n, router, isStaff, () => setIsOpen(false));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông Thông Báo Sang Trọng Chuẩn Real - Không Emoji */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl bg-[#FAF5EE] hover:bg-[#F2E8DC] dark:bg-[#27231F] dark:hover:bg-[#3C3630] border border-[#DECFC0] dark:border-[#474039] text-[#5C3A24] dark:text-[#E8DCCE] transition-all duration-200 flex items-center justify-center shadow-xs active:scale-95 group"
        title="Thông báo hệ thống"
        aria-label="Thông báo hệ thống"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:rotate-12 duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Chấm Thông Báo Terracotta Bronze Tinh Tế */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B34E2E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B34E2E] ring-1.5 ring-white dark:ring-[#20140D]"></span>
          </span>
        )}
      </button>

      {/* Dropdown Menu Sang Trọng Gam Màu Cafe Latte & Espresso */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-[#FCFAF7] dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] rounded-2xl shadow-2xl py-2 z-50 text-[#361F12] dark:text-[#F7EFE6] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2.5 border-b border-[#EFE7DA] dark:border-[#474039] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
              <span className="font-bold text-xs uppercase tracking-wider text-[#6E4F38] dark:text-[#B59D89]">
                Thông Báo Trang Trại ({unreadCount})
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#A06C3E] dark:text-[#D4AF7A] hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#EFE7DA]/60 dark:divide-[#38261A]/60">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#A88C76]">
                Không có thông báo mới
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs transition cursor-pointer hover:bg-[#F5EEE4]/80 dark:hover:bg-[#3C3630]/80 group ${
                    !n.read ? 'bg-[#FAF5EE] dark:bg-[#23150D]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Real Vector Icon theo từng loại thông báo */}
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'alert' && (
                        <div className="w-6 h-6 rounded-lg bg-[#FBEAE5] dark:bg-[#3D1D14] flex items-center justify-center text-[#B34E2E]">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        </div>
                      )}
                      {n.type === 'success' && (
                        <div className="w-6 h-6 rounded-lg bg-[#EFE9DD] dark:bg-[#2D1F15] flex items-center justify-center text-[#5C3A24] dark:text-[#C28E58]">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        </div>
                      )}
                      {n.type === 'info' && (
                        <div className="w-6 h-6 rounded-lg bg-[#F5EEE4] dark:bg-[#322D28] flex items-center justify-center text-[#8C6E56] dark:text-[#D4AF7A]">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-xs group-hover:text-[#C28E58] transition-colors ${!n.read ? 'text-[#361F12] dark:text-[#FFF5EA]' : 'text-[#634936] dark:text-[#DAC7B5]'}`}>
                        {n.title}
                      </p>
                      <p className="text-[#73543E] dark:text-[#B59D89] text-[11px] mt-0.5 leading-relaxed">
                        {n.desc}
                      </p>
                      <div className="flex items-center justify-between gap-1 mt-1.5">
                        <span className="text-[10px] text-[#A07A5D] dark:text-[#8C6E56]">
                          {n.time}
                        </span>
                        <span className="text-[10px] font-bold text-[#C28E58] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          {n.badge} →
                        </span>
                      </div>
                    </div>

                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58] shrink-0 mt-1.5"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#EFE7DA] dark:border-[#474039] text-center">
            <span className="text-[10px] text-[#A88C76] flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Đồng bộ dữ liệu thời gian thực qua Socket.io
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
