'use client';

import React, { useEffect, useState } from 'react';

/**
 * Component hiển thị trạng thái kết nối mạng và trung tâm dữ liệu
 * Ngăn chặn màn hình trắng khi mất kết nối, giữ lại cache an toàn
 * Phụ trách: Đăng
 */
export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center transition-all sticky top-0 z-[100] shadow-sm flex items-center justify-center gap-2">
        <span>✨</span>
        <span>Đã khôi phục kết nối thành công với trung tâm dữ liệu MushroomCloud!</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-slate-950 text-xs font-semibold py-1.5 px-4 text-center transition-all sticky top-0 z-[100] flex items-center justify-center gap-2 shadow-sm">
      <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
      <span>Mất kết nối mạng. Hệ thống đang tự động kết nối lại và lưu giữ dữ liệu đệm (Cache) an toàn...</span>
    </div>
  );
}
