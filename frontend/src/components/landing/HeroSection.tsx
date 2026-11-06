"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ChamberView {
  id: string;
  name: string;
  badge: string;
  image: string;
  temp: string;
  hum: string;
  co2: string;
  desc: string;
}

const chamberViews: ChamberView[] = [
  {
    id: "portal",
    name: "Buồng Nuôi Phòng Sạch 3D",
    badge: "ISO Class 5 • Giám Sát 24/7",
    image: "/images/view-portal-macro.jpg",
    temp: "24.0°C",
    hum: "91%",
    co2: "650 ppm",
    desc: "Cận cảnh khay nấm Bào Ngư phát triển trong buồng kính với camera góc cận và cảm biến vi khí hậu",
  },
  {
    id: "control",
    name: "Trung Tâm Điều Hành Trang Trại",
    badge: "IoT Telemetry Hub",
    image: "/images/view-operator-hub.jpg",
    temp: "22.5°C",
    hum: "65%",
    co2: "450 ppm",
    desc: "Phòng điều hành trung tâm giám sát đồng loạt các buồng nuôi, van phun sương và quạt đối lưu",
  },
  {
    id: "facility",
    name: "Cơ Sở Nuôi Cấy Đa Tầng FaaS",
    badge: "Smart Multi-Tier Racks",
    image: "/images/view-farm-facility.jpg",
    temp: "25.0°C",
    hum: "88%",
    co2: "590 ppm",
    desc: "Hệ thống dàn kệ nuôi nấm quy mô lớn tích hợp tự động hóa điều hòa vi khí hậu chuẩn VietGAP",
  },
  {
    id: "cube",
    name: "Buồng Kính Lập Phương Cách Ly",
    badge: "Terrarium Chamber",
    image: "/images/chamber-clean-crop.png",
    temp: "24.2°C",
    hum: "92%",
    co2: "680 ppm",
    desc: "Mô hình buồng kính lập phương cách nhiệt độc lập với làn sương ẩm siêu âm tự động",
  },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState(0);
  const currentView = chamberViews[activeTab];

  return (
    <section className="relative bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-12 sm:py-20 px-6 overflow-hidden transition-colors">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Split: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Cột Trái: Tiêu đề, Thông điệp & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Nền Tảng Nông Trại Nấm Thông Minh FaaS</span>
            </div>

            {/* Headline chính */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Nông Trại Nấm Thông Minh{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Trong Tầm Tay Của Bạn
              </span>
            </h1>

            {/* Mô tả giải pháp */}
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Trải nghiệm mô hình nuôi trồng nấm dược liệu công nghệ cao khép kín chuẩn ISO: Thuê khay nấm trực tuyến, giám sát vi khí hậu 24/7 qua cảm biến IoT & Camera Live Stream, nhận nấm tươi thu hoạch tận nhà.
            </p>

            {/* Cụm Nút CTA Kép */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#packages"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0D5C3A] hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Thuê Khay Ngay (Khám Phá)</span>
                <span>→</span>
              </a>

              <a
                href="#portal"
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition flex items-center gap-2"
              >
                <span>📹</span>
                <span>Xem Demo Camera Trực Tiếp</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                Giao dịch khóa dòng CSDL T-SQL
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                Chứng nhận nguồn gốc VietGAP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                Bảo hiểm 100% sản lượng
              </span>
            </div>
          </div>

          {/* Cột Phải: Showcase Buồng Kính Hiện Đại (Trắng Tinh Tế, Không Hộp Đen) */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            
            {/* Bộ Nút Chuyển Đổi Tab Siêu Nét - Kiểu Dáng Apple Segments */}
            <div className="w-full flex items-center justify-between gap-1 p-1 mb-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              {chamberViews.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center truncate ${
                    activeTab === idx
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  title={v.name}
                >
                  {v.name.split(" ")[0]} {v.name.split(" ")[1]}
                </button>
              ))}
            </div>

            {/* Khung Kính Showcase Sang Trọng Màu Sáng */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 group transition-all duration-500">
              {/* Hình Ảnh Nét Căng 1376x768 */}
              <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                <Image
                  key={currentView.image}
                  src={currentView.image}
                  alt={currentView.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Lớp bóng kính mờ nhẹ ở đáy */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Badge Trạng Thái Nổi Góc Trên */}
                <div className="absolute top-3 left-3 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>{currentView.badge}</span>
                </div>

                {/* 3 Chip Cảm Biến Realtime Nổi Góc Trên Phải */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <div className="backdrop-blur-md bg-slate-900/85 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>🌡️ {currentView.temp}</span>
                  </div>
                  <div className="backdrop-blur-md bg-slate-900/85 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>💧 {currentView.hum}</span>
                  </div>
                </div>

                {/* Chú Thích Dưới Đáy Ảnh */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-1.5">
                    <span>{currentView.name}</span>
                  </h3>
                  <p className="text-xs text-slate-200/90 line-clamp-1 mt-0.5 font-normal">
                    {currentView.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi chú gợi ý bấm chọn */}
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 text-center font-medium">
              💡 Bấm chọn các tab phía trên để chuyển đổi giữa 4 góc nhìn nông trại công nghệ cao thực tế
            </p>
          </div>

        </div>

        {/* Chân Hero: Cụm 4 Thẻ Bento Tính Năng Ngang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
              🌱
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Mô hình FaaS</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Thuê khay nấm sạch theo chu kỳ chuẩn quốc tế
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-xl shrink-0">
              📡
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Cảm biến IoT Realtime</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Đo đạc vi khí hậu và cảnh báo tự động qua Socket
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
              📹
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Camera Live Stream</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Quan sát buồng sạch vô trùng 1080p góc cận
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-300 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
              📦
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Giao Nấm Tận Nhà</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Nghiệm thu cân ký kèm chứng nhận VietGAP
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
