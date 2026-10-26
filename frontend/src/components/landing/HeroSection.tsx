import React from "react";

export default function HeroSection() {
  return (
    <section className="relative bg-[#0F172A] text-white py-20 px-6 min-h-[70vh] flex flex-col justify-center items-center text-center overflow-hidden">
      {/* Thẻ HUD Vi Khí Hậu Nổi */}
      <div className="z-10 mb-8 flex flex-wrap justify-center gap-6 bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full border border-[#D4AF37]/40 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <span>🌡️ Nhiệt Độ: 23.8°C</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <span>💧 Độ Ẩm: 90%</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <span>💨 CO2: 620 ppm</span>
        </div>
      </div>

      {/* Banner chính */}
      <div className="z-10 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Nông Nghiệp Thông Minh <br />
          <span className="text-[#D4AF37]">MushroomCloud FaaS</span>
        </h1>
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light">
          Sở hữu khay nuôi nấm sạch phòng chuẩn ISO ngay tại trang trại. Giám sát vi khí hậu và quy trình lớn lên từ xa qua mã QR & Camera Live Stream 24/7.
        </p>
        <div className="pt-4">
          <a
            href="#packages"
            className="bg-[#0D5C3A] hover:bg-[#0D5C3A]/80 text-white font-semibold px-8 py-3 rounded-lg transition shadow-md border border-[#D4AF37]/50 inline-block"
          >
            Khám Phá Gói Thuê
          </a>
        </div>
      </div>
    </section>
  );
}
