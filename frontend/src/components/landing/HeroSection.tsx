import React from "react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 py-16 sm:py-24 px-6 overflow-hidden transition-colors">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Split: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Cột Trái: Tiêu đề, Thông điệp & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Nền Tảng Nông Trại Nấm Thông Minh FaaS</span>
            </div>

            {/* Headline lớn sang trọng */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Nông Trại Nấm Thông Minh <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0D5C3A] dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
                Trong Tầm Tay Của Bạn
              </span>
            </h1>

            {/* Mô tả giải pháp */}
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
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
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
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

          {/* Cột Phải: Buồng Nấm 3D Terrarium & Holographic Chips */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 group">
              {/* Ảnh 3D Terrarium Chamber */}
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/hero-chamber.png"
                  alt="3D Smart Mushroom Cleanroom Chamber"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Lớp phủ chuyển màu viền kính */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

              {/* 3 Thẻ Hologram Vi Khí Hậu Nổi */}
              <div className="absolute top-4 left-4 backdrop-blur-md bg-slate-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Nhiệt độ: 24.2°C</span>
              </div>

              <div className="absolute top-4 right-4 backdrop-blur-md bg-slate-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Độ ẩm: 92%</span>
              </div>

              <div className="absolute bottom-4 right-4 backdrop-blur-md bg-slate-900/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>CO2: 680 ppm</span>
              </div>
            </div>
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
