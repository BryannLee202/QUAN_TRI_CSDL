import React from 'react';

export default function SensorCharts() {
  return (
    <div className="bg-white dark:bg-[#20140D] rounded-2xl p-6 shadow-sm border border-[#E0D3C1] dark:border-[#543825] space-y-4 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#24170E] dark:text-[#E2BA78]">📊 Biểu Đồ Vi Khí Hậu 24h (Realtime)</h3>
        <span className="text-xs bg-[#FAF5EE] dark:bg-[#2B1C13] text-[#6E4B33] dark:text-[#E2BA78] font-semibold px-2.5 py-1 rounded-md border border-[#E0D3C1] dark:border-[#543825]">
          Cập nhật mỗi 5 giây
        </span>
      </div>

      <p className="text-xs text-[#735843] dark:text-[#DAC7B5]">
        Theo dõi biến thiên nhiệt độ, độ ẩm và nồng độ CO2 trong buồng nuôi phòng sạch.
      </p>

      {/* Khung Giả Lập Đồ Thị Sensor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-[#FAF8F5] dark:bg-[#1A110A] p-4 rounded-xl border border-[#EAE1D3] dark:border-[#38261A] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#735843] dark:text-[#DAC7B5]">
            <span>🌡️ Nhiệt Độ Avg</span>
            <span className="text-[#C28E58] font-mono">23.8°C</span>
          </div>
          <div className="h-16 bg-[#C28E58]/10 rounded-lg flex items-end justify-between p-2 gap-1">
            <div className="w-1/5 bg-[#C28E58] h-[60%] rounded-t"></div>
            <div className="w-1/5 bg-[#C28E58] h-[80%] rounded-t"></div>
            <div className="w-1/5 bg-[#C28E58] h-[75%] rounded-t"></div>
            <div className="w-1/5 bg-[#C28E58] h-[90%] rounded-t"></div>
            <div className="w-1/5 bg-[#C28E58] h-[70%] rounded-t"></div>
          </div>
        </div>

        <div className="bg-[#FAF8F5] dark:bg-[#1A110A] p-4 rounded-xl border border-[#EAE1D3] dark:border-[#38261A] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#735843] dark:text-[#DAC7B5]">
            <span>💧 Độ Ẩm Avg</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-mono">90%</span>
          </div>
          <div className="h-16 bg-cyan-500/10 rounded-lg flex items-end justify-between p-2 gap-1">
            <div className="w-1/5 bg-cyan-500 h-[85%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[90%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[88%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[95%] rounded-t"></div>
            <div className="w-1/5 bg-cyan-500 h-[90%] rounded-t"></div>
          </div>
        </div>

        <div className="bg-[#FAF8F5] dark:bg-[#1A110A] p-4 rounded-xl border border-[#EAE1D3] dark:border-[#38261A] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#735843] dark:text-[#DAC7B5]">
            <span>🍃 Nồng Độ CO2</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">620 ppm</span>
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