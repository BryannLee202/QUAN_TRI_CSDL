'use client';

import React from 'react';

/**
 * AppDownloadSection Component
 * Giới thiệu ứng dụng di động MushroomCloud Mobile App (iOS & Android)
 * Thiết kế chuẩn ứng dụng công nghệ cao phong cách Cafe Latte Bắc Âu
 */
export default function AppDownloadSection() {
  return (
    <section id="mobile-app" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="relative rounded-[32px] bg-gradient-to-br from-[#24170E] via-[#2F1C12] to-[#170E08] text-white p-8 sm:p-12 lg:p-16 border border-[#543825] shadow-2xl overflow-hidden">
        {/* Họa Tiết Nền Ánh Kim & Vi Khí Hậu Mờ Ảo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#C28E58]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#6B442C]/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Cột Trái: Thông Tin Ứng Dụng Di Động */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3D2517] border border-[#6B442C] text-xs font-bold text-[#E2BA78]">
              <span className="w-2 h-2 rounded-full bg-[#C28E58] animate-ping"></span>
              <span>ỨNG DỤNG DI ĐỘNG ĐỒNG HÀNH 24/7 • IOS & ANDROID</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FFF5EA] tracking-tight leading-tight">
                Nông Trại Nấm Thông Minh <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C28E58] via-[#E2BA78] to-[#F5D8AC]">
                  Ngay Trong Tầm Tay
                </span>
              </h2>
              <p className="text-sm sm:text-base text-[#DAC7B5] leading-relaxed max-w-xl">
                Cài đặt ứng dụng MushroomCloud trên smartphone để theo dõi vi khí hậu buồng nấm, xem camera livestream 4K góc cận, nhận thông báo đẩy tức thời và điều khiển thu hoạch mọi lúc, mọi nơi.
              </p>
            </div>

            {/* Danh Sách Tính Năng App Nổi Bật */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-3 bg-[#1F130B]/80 p-3 rounded-2xl border border-[#422C1D]">
                <div className="w-9 h-9 rounded-xl bg-[#2B1C13] border border-[#543825] flex items-center justify-center text-[#C28E58] shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <div className="text-xs">
                  <strong className="text-[#FFF5EA] block">Widget Màn Hình Khóa</strong>
                  <span className="text-[#DAC7B5] text-[11px]">Cập nhật nhiệt độ & độ ẩm 5s</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1F130B]/80 p-3 rounded-2xl border border-[#422C1D]">
                <div className="w-9 h-9 rounded-xl bg-[#2B1C13] border border-[#543825] flex items-center justify-center text-[#C28E58] shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </div>
                <div className="text-xs">
                  <strong className="text-[#FFF5EA] block">Push Notification</strong>
                  <span className="text-[#DAC7B5] text-[11px]">Báo nấm đạt chuẩn thu hoạch</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1F130B]/80 p-3 rounded-2xl border border-[#422C1D]">
                <div className="w-9 h-9 rounded-xl bg-[#2B1C13] border border-[#543825] flex items-center justify-center text-[#C28E58] shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 7-6 4 6 4V7Z" />
                    <rect width="14" height="12" x="2" y="6" rx="3" />
                  </svg>
                </div>
                <div className="text-xs">
                  <strong className="text-[#FFF5EA] block">Camera PTZ Góc Cận</strong>
                  <span className="text-[#DAC7B5] text-[11px]">Thu phóng 4x Full HD 60fps</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1F130B]/80 p-3 rounded-2xl border border-[#422C1D]">
                <div className="w-9 h-9 rounded-xl bg-[#2B1C13] border border-[#543825] flex items-center justify-center text-[#C28E58] shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="text-xs">
                  <strong className="text-[#FFF5EA] block">Xác Thực Chuẩn VietGAP</strong>
                  <span className="text-[#DAC7B5] text-[11px]">Quét QR truy xuất nguồn gốc</span>
                </div>
              </div>
            </div>

            {/* Các Nút Tải Ứng Dụng Store Chính Thức */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              {/* Nút App Store */}
              <button
                type="button"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1C120C] hover:bg-[#2B1C13] border border-[#543825] text-white shadow-lg transition-all group"
              >
                <svg className="w-7 h-7 text-white group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.72-.94 2.74 1 .08 2.04-.5 2.66-1.25Z" />
                </svg>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-semibold text-[#BFA895] block leading-none">
                    Tải Miễn Phí Trên
                  </span>
                  <span className="text-base font-bold text-[#FFF5EA] leading-tight block">
                    App Store
                  </span>
                </div>
              </button>

              {/* Nút Google Play */}
              <button
                type="button"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1C120C] hover:bg-[#2B1C13] border border-[#543825] text-white shadow-lg transition-all group"
              >
                <svg className="w-7 h-7 text-[#E2BA78] group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814 13.792 12 3.61 22.186a2.072 2.072 0 0 1-.61-.926V2.74c.14-.37.36-.696.61-.926zm11.602 11.602 2.678 2.678-11.83 6.786 9.152-9.464zm2.678-2.678L15.21 8.06l-9.153-9.464 11.832 6.786zM19.34 10.66l2.197 1.26a1.26 1.26 0 0 1 0 2.16l-2.197 1.26-2.38-2.34 2.38-2.34z" />
                </svg>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-semibold text-[#BFA895] block leading-none">
                    Khám Phá Trên
                  </span>
                  <span className="text-base font-bold text-[#FFF5EA] leading-tight block">
                    Google Play
                  </span>
                </div>
              </button>

              {/* Huy Hiệu PWA Web App */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2B1C13]/60 border border-[#422C1D] text-xs text-[#DAC7B5]">
                <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" x2="22" y1="12" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Hỗ trợ Web App (PWA) trên máy tính bảng & PC</span>
              </div>
            </div>
          </div>

          {/* Cột Phải: Mô Phỏng Thiết Bị Điện Thoại Smartphone Thực Tế */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[290px] sm:max-w-[310px] rounded-[44px] bg-[#120B07] border-4 border-[#543825] shadow-2xl p-3.5 space-y-3">
              {/* Dynamic Island / Loa Thoại */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-end px-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              {/* Màn Hình Ứng Dụng Di Động Bên Trong Smartphone */}
              <div className="bg-[#1C120C] rounded-[32px] p-4 space-y-3.5 border border-[#3D2517] shadow-inner text-xs">
                {/* Header App Di Động */}
                <div className="flex items-center justify-between border-b border-[#362114] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#C28E58] flex items-center justify-center text-[#1C120C] font-black text-[10px]">
                      MC
                    </div>
                    <div>
                      <h4 className="font-bold text-[#FFF5EA] text-[11px]">MushroomCloud App</h4>
                      <p className="text-[9px] text-[#DAC7B5]">Khay #TR-08 • Phòng Sạch 01</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Live Stream
                  </span>
                </div>

                {/* Khung Camera Stream Nhỏ Trên Điện Thoại */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#543825] shadow-xs">
                  <img
                    src="/images/hero-view-mushroom-macro.jpg"
                    alt="Mobile Camera Live"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span>1080P REC</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-[#E2BA78]">
                    D15 / 30
                  </div>
                </div>

                {/* 3 Thẻ Đo Vi Khí Hậu Mini Trong App */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-[#2B1C13] p-2 rounded-xl border border-[#422C1D]">
                    <span className="text-[9px] text-[#DAC7B5] block">Nhiệt Độ</span>
                    <strong className="text-xs font-mono text-[#E2BA78]">23.8°C</strong>
                  </div>
                  <div className="bg-[#2B1C13] p-2 rounded-xl border border-[#422C1D]">
                    <span className="text-[9px] text-[#DAC7B5] block">Độ Ẩm</span>
                    <strong className="text-xs font-mono text-cyan-400">92%</strong>
                  </div>
                  <div className="bg-[#2B1C13] p-2 rounded-xl border border-[#422C1D]">
                    <span className="text-[9px] text-[#DAC7B5] block">Khí CO₂</span>
                    <strong className="text-xs font-mono text-amber-400">620</strong>
                  </div>
                </div>

                {/* Nút Thao Tác Nhanh */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    className="py-2 px-2.5 rounded-xl bg-[#523522] hover:bg-[#3D2517] text-[#FFF5EA] text-[10px] font-bold text-center border border-[#C28E58] transition"
                  >
                    Thu Hoạch Nấm
                  </button>
                  <button
                    type="button"
                    className="py-2 px-2.5 rounded-xl bg-[#2B1C13] hover:bg-[#362114] text-[#E2BA78] text-[10px] font-bold text-center border border-[#422C1D] transition"
                  >
                    Bật Phun Sương
                  </button>
                </div>
              </div>

              {/* Thanh Home Bar / Indicator Của Smartphone */}
              <div className="w-28 h-1 bg-[#543825] rounded-full mx-auto mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
