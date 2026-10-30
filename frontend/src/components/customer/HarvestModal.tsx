import React, { useState } from 'react';

export default function HarvestModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-[#0F172A]">🧺 Yêu Cầu Thu Hoạch & Đóng Gói</h3>
        <p className="text-xs text-slate-500">
          Khay nấm đã đạt chu kỳ thu hoạch tiêu chuẩn. Nhấn nút để gửi lệnh thu hoạch đến kỹ thuật viên trang trại.
        </p>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto px-6 py-3 bg-[#0F172A] hover:bg-[#0D5C3A] text-white font-bold text-sm rounded-xl border-2 border-[#D4AF37] shadow-lg transition transform active:scale-95 shrink-0"
      >
        ✨ Gửi Yêu Cầu Thu Hoạch
      </button>

      {/* Modal Popup Confirm */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h4 className="font-bold text-xl text-[#0F172A]">Xác Nhận Thu Hoạch Nấm</h4>
            <p className="text-sm text-slate-600">
              Kỹ thuật viên sẽ tiến hành cắt nấm, sấy thăng hoa hoặc đóng gói tươi và giao đến địa chỉ đăng ký của bạn.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  alert('Gửi yêu cầu thu hoạch thành công!');
                  setIsOpen(false);
                }}
                className="px-5 py-2 text-sm font-bold bg-[#0D5C3A] text-white rounded-lg shadow transition"
              >
                Xác Nhận Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}