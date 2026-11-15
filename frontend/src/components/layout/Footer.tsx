import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#FAF7F2] dark:bg-[#140E0A] text-[#735843] dark:text-[#DAC7B5] py-10 px-6 border-t border-[#EAE1D3] dark:border-[#38261A] transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#D9C8B5] dark:border-[#543825] flex items-center justify-center p-1 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="#6B442C" />
              <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="#C28E58" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="#6B442C" />
              <circle cx="34" cy="20" r="3" fill="#C28E58" />
              <circle cx="23" cy="22" r="2" fill="#C28E58" />
              <circle cx="45" cy="22" r="2" fill="#C28E58" />
            </svg>
          </div>
          <span className="font-bold text-[#24170E] dark:text-[#FFF5EA]">
            MushroomCloud • Nền Tảng Nông Trại Thông Minh Farm-as-a-Service
          </span>
        </div>
        <p className="text-center sm:text-right text-[#8C6D53] dark:text-[#BFA895]">
          Đồ Án Môn Học Quản Trị Cơ Sở Dữ Liệu Nâng Cao • ĐH Sư Phạm Kỹ Thuật TP.HCM (HCMUTE)
        </p>
      </div>
    </footer>
  );
}
