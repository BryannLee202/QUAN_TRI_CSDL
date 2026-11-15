'use client';

import React, { useEffect, useState } from 'react';

/**
 * Công tắc chuyển đổi giao diện Sáng / Tối (Dark / Light Theme Toggle)
 * Thiết kế chuẩn Luxury Cafe Latte & Vector SVG sắc nét, loại bỏ hoàn toàn Emoji
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('mushroomcloud_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mushroomcloud_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mushroomcloud_theme', 'light');
    }
  };

  if (!mounted) {
    return (
      <div className="h-9 w-20 bg-[#F2E8DC] dark:bg-[#20140D] rounded-xl animate-pulse shrink-0 border border-[#DECFC0] dark:border-[#422C1D]"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Chuyển đổi giao diện Sáng / Tối"
      className="h-9 px-3 rounded-xl bg-[#FAF5EE] hover:bg-[#F2E8DC] dark:bg-[#20140D] dark:hover:bg-[#2B1C13] text-[#5C3A24] dark:text-[#E8DCCE] transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap shadow-xs border border-[#DECFC0] dark:border-[#422C1D] flex items-center gap-1.5 text-[11px] font-bold group"
    >
      {isDark ? (
        // Icon Mặt Trời Vector
        <svg
          className="w-4 h-4 text-[#C28E58] transition-transform duration-300 group-hover:rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Icon Mặt Trăng Vector
        <svg
          className="w-4 h-4 text-[#8C6E56] transition-transform duration-300 group-hover:-rotate-12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
      <span className="tracking-wide">{isDark ? 'Sáng' : 'Tối'}</span>
    </button>
  );
}
