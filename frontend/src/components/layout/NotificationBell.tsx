'use client';

import React, { useState, useRef, useEffect } from 'react';

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
    desc: 'Nhiệt độ đạt ngưỡng 24.5°C. Hệ thống đã tự động kích hoạt rèm lạnh.',
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

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        title="Thông báo hệ thống"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-slate-800 dark:text-slate-100">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Thông Báo Trang Trại ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#0D5C3A] dark:text-emerald-400 hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Không có thông báo mới
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markItemAsRead(n.id)}
                  className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !n.read ? 'bg-emerald-50/40 dark:bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm mt-0.5">
                      {n.type === 'alert' ? '⚠️' : n.type === 'success' ? '✅' : '📢'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${!n.read ? 'text-[#0D5C3A] dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        {n.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.time}
                      </span>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400">
              Đồng bộ dữ liệu thời gian thực qua Socket.io
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
