import React from 'react';

export default function SensorCharts() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#0F172A]">📊 Biểu Đồ Vi Khí Hậu 24h (Realtime)</h3>
        <span className="text-xs bg-emerald-100 text-[#0D5C3A] font-semibold px-2.5 py-1 rounded-md">
          Cập nhật mỗi 5 giây
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Theo dõi biến thiên nhiệt độ, độ ẩm và nồng độ CO2 trong buồng nuôi phòng sạch.
      </p>

      {/* Khung Giả Lập Đồ Thị Sensor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>🌡️ Nhiệt Độ Avg</span>
            <span className="text-emerald-600">23.8°C</span>
          </div>
          <div className="h-16 bg-emerald-500/10 rounded-lg flex items-end justify-between p-2 gap-1">
            <div className="w-1/5 bg-emerald-500 h-[60%] rounded-t"></div>
            <div className="w-1/5 bg-emerald-500 h-[80%] rounded-t"></div>
            <div className="w-1/5 bg-emerald-500 h-[75%] rounded-t"></div>
            <div className="w-1/5 bg-emerald-500 h-[90%] rounded-t"></div>
            <div className="w-1/5 bg-emerald-500 h-[70%] rounded-t"></div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>💧 Độ Ẩm Avg</span>
            <span className="text-cyan-600">90%</span>
          </div>
          <div className="h-16 bg-cyan-500/10 rounded-lg flex items-end justify-between p-2 gap-1">
            <div className="w-1/5 bg-cyan-500 h-[85%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[90%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[88%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[95%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[90%] rounded-t"></div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>🍃 Nồng Độ CO2</span>
            <span className="text-amber-600">620 ppm</span>
          </div>
          <div className="h-16 bg-amber-500/10 rounded-lg flex items-end justify-between p-2 gap-1">
            <div className="w-1/5 bg-amber-500 h-[50%] rounded-t"></div>
            <div className="w-1/5 bg-amber-500 h-[65%] rounded-t"></div>
            <div className="w-1/5 bg-amber-500 h-[60%] rounded-t"></div>
            <div className="w-1/5 bg-amber-500 h-[70%] rounded-t"></div>
            <div className="w-1/5 bg-amber-500 h-[55%] rounded-t"></div>
          </div>
        </div>
      </div>
    </div>
  );
}