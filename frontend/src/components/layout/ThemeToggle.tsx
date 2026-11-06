'use client';

import React, { useEffect, useState } from 'react';

/**
 * Công tắc chuyển đổi giao diện Sáng / Tối (Dark / Light Theme Toggle)
 * Phụ trách: Võ Duy Thịnh
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
      <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse shrink-0"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Chuyển đổi giao diện Sáng / Tối"
      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition transform active:scale-95 shrink-0 whitespace-nowrap shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
    >
      <span>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Sáng' : 'Tối'}</span>
    </button>
  );
}
