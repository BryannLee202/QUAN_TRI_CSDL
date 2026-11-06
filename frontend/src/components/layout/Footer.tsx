import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-10 px-6 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <span className="text-base">🍄</span>
          <span>MushroomCloud • Farm-as-a-Service Platform</span>
        </div>
        <p className="text-center sm:text-right text-slate-400">
          Đồ Án Môn Học Quản Trị Cơ Sở Dữ Liệu Nâng Cao • ĐH Sư Phạm Kỹ Thuật TP.HCM (HCMUTE)
        </p>
      </div>
    </footer>
  );
}
