'use client';

import React, { useState, useEffect } from 'react';

/**
 * CameraFeed Component - Live Stream Giám Sát Buồng Nuôi Vi Khí Hậu
 * Đồng bộ phong cách Cafe Latte Bắc Âu sang trọng, camera HUD chuẩn IoT Farm-as-a-Service
 */
export default function CameraFeed() {
  const [zoomLevel, setZoomLevel] = useState<'1x' | '2x' | '4x'>('1x');
  const [selectedAngle, setSelectedAngle] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');

  const angles = [
    {
      id: 'cam-01',
      name: 'Toàn Cảnh Buồng Nuôi',
      badge: 'Góc Rộng 120°',
      image: '/images/hero-chamber-champagne.jpg',
      scale: { '1x': 'scale-100', '2x': 'scale-125', '4x': 'scale-150' },
    },
    {
      id: 'cam-02',
      name: 'Cận Cảnh Quả Thể Macro',
      badge: 'Ống Kính 4K Macro',
      image: '/images/hero-view-mushroom-macro.jpg',
      scale: { '1x': 'scale-100', '2x': 'scale-130', '4x': 'scale-165' },
    },
    {
      id: 'cam-03',
      name: 'Giàn Nuôi Đa Tầng',
      badge: 'Hệ Kệ Vô Trùng',
      image: '/images/hero-view-facility-multitier.jpg',
      scale: { '1x': 'scale-100', '2x': 'scale-120', '4x': 'scale-145' },
    },
  ];

  // Đồng hồ thời gian thực HUD
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC+7'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCam = angles[selectedAngle];

  return (
    <div className="bg-[#1C120C] text-[#F7EFE6] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#422C1D] space-y-4 transition-all">
      {/* Thanh Tiêu Đề Camera & Trạng Thái Kết Nối */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#362114] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2B1C13] border border-[#543825] flex items-center justify-center text-[#E2BA78] shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 7-6 4 6 4V7Z" />
              <rect width="14" height="12" x="2" y="6" rx="3" />
              <circle cx="9" cy="12" r="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#FFF5EA] flex items-center gap-2">
              <span>Camera Giám Sát Trực Tiếp 24/7</span>
            </h3>
            <p className="text-xs text-[#DAC7B5]">
              Ống kính PTZ cảm biến quang học • Khay #TR-08 (Bào Ngư Xám)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-700/60 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>1080p 60fps • Live</span>
          </span>
        </div>
      </div>

      {/* Bộ Chọn Góc Quay (Angle Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {angles.map((ang, idx) => (
          <button
            key={ang.id}
            onClick={() => setSelectedAngle(idx)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
              selectedAngle === idx
                ? 'bg-[#C28E58] text-[#1C120C] font-bold shadow-md'
                : 'bg-[#2B1C13] text-[#DAC7B5] hover:bg-[#3D261A] border border-[#422C1D]'
            }`}
          >
            <span>{ang.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              selectedAngle === idx ? 'bg-black/20 text-[#1C120C]' : 'bg-[#1C120C] text-[#C28E58]'
            }`}>
              {ang.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Khung Màn Hình Live Camera Với HUD Chuyên Nghiệp */}
      <div className="relative aspect-video bg-[#0D0805] rounded-2xl overflow-hidden border border-[#422C1D] shadow-inner group">
        {/* Ảnh Truyền Phát Trực Tiếp Theo Góc & Zoom */}
        <div className="w-full h-full overflow-hidden flex items-center justify-center bg-black">
          <img
            src={currentCam.image}
            alt={currentCam.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${currentCam.scale[zoomLevel]}`}
          />
        </div>

        {/* Lớp Kính Mờ & Hiệu Ứng Quét Camera (Scanline / Grid Overlay) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/50"></div>

        {/* Khung Thước Ngắm Góc (Camera Reticle Corner Brackets) */}
        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#C28E58]/80 pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#C28E58]/80 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#C28E58]/80 pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#C28E58]/80 pointer-events-none"></div>

        {/* HUD Góc Trên Trái: REC Live + Thời Gian Đồng Bộ */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-mono text-[#FFF5EA]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-red-400">REC • LIVE</span>
            <span className="text-[#DAC7B5] border-l border-white/20 pl-2">
              {currentTime || '2026-11-16 05:58:00 UTC+7'}
            </span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-mono text-[#E2BA78] border border-white/10 w-fit">
            CAM_ID: {currentCam.id.toUpperCase()} • SENSOR_SYNC: 100%
          </div>
        </div>

        {/* HUD Góc Trên Phải: Cấu Hình Quang Học & Bitrate */}
        <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-mono text-[#DAC7B5]">
            H.265+ • 4.8 Mbps • LUX: 460
          </div>
        </div>

        {/* HUD Góc Dưới Trái: Telemetry Vi Khí Hậu Trực Tiếp Trên Stream */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs font-mono text-white flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#C28E58]">T:</span>
            <span className="font-bold text-[#FFF5EA]">24.2°C</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sky-400">RH:</span>
            <span className="font-bold text-[#FFF5EA]">92%</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">CO₂:</span>
            <span className="font-bold text-[#FFF5EA]">620 ppm</span>
          </div>
        </div>

        {/* HUD Góc Dưới Phải: Nút Điều Khiển Thu Phóng Zoom */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15">
          <span className="text-[10px] font-bold text-[#DAC7B5] px-2 uppercase tracking-wider hidden sm:inline">
            Zoom
          </span>
          {(['1x', '2x', '4x'] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoomLevel(z)}
              className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg transition-all ${
                zoomLevel === z
                  ? 'bg-[#C28E58] text-[#1C120C] shadow-sm'
                  : 'text-[#DAC7B5] hover:bg-white/10'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
