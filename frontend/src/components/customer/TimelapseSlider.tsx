import React, { useState } from 'react';

export default function TimelapseSlider() {
  const [day, setDay] = useState(15);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#0F172A]">🎞️ Thước Tua Timelapse Lịch Sử Nấm Lớn</h3>
        <span className="text-sm font-extrabold text-[#0D5C3A] bg-emerald-50 px-3 py-1 rounded-lg">
          Ngày thứ {day} / 30
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Kéo thanh trượt để xem lại toàn bộ hình ảnh quá trình sinh trưởng của khay nấm từ Ngày 01 đến Ngày 30.
      </p>

      {/* Thanh Trượt Slider */}
      <div className="space-y-2 pt-2">
        <input
          type="range"
          min="1"
          max="30"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D5C3A]"
        />
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Ngày 1 (Gieo Mầm)</span>
          <span>Ngày 15 (Lớn Nhanh)</span>
          <span>Ngày 30 (Thu Hoạch)</span>
        </div>
      </div>

      {/* Khung Khái Quát Tiến Độ */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
        <span className="text-3xl">🌱</span>
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-700">Trạng thái sinh trưởng ngày {day}:</p>
          <p className="text-slate-500">
            {day < 10
              ? 'Giai đoạn tơ nấm ăn tơ phủ kín giá thể khay.'
              : day < 22
              ? 'Giai đoạn ra quả thể, hình thành mũ nấm phát triển mạnh.'
              : 'Nấm đã đạt kích thước tiêu chuẩn, sẵn sàng thu hoạch!'}
          </p>
        </div>
      </div>
    </div>
  );
}