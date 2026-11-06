'use client';
import React, { useState } from 'react';
import { triggerSuccessConfetti } from '../../utils/confetti';
import CertificateModal from '../modals/CertificateModal';

export default function HarvestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHarvested, setIsHarvested] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-[#0F172A] dark:text-emerald-400">
            🧺 Yêu Cầu Thu Hoạch & Chứng Nhận VietGAP
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khay nấm đã đạt chu kỳ thu hoạch tiêu chuẩn. Xem chứng nhận nguồn gốc hoặc gửi lệnh thu hoạch đến kỹ thuật viên trang trại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsCertOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#0D5C3A] dark:text-emerald-300 font-bold text-xs rounded-xl border border-amber-300 dark:border-amber-500/40 shadow-sm transition flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <span>🏆</span>
            <span>Chứng Nhận VietGAP</span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0F172A] hover:bg-[#0D5C3A] text-white font-bold text-xs rounded-xl border-2 border-[#D4AF37] shadow-lg transition transform active:scale-95 shrink-0 whitespace-nowrap"
          >
            ✨ Gửi Lệnh Thu Hoạch
          </button>
        </div>

        {/* Modal Popup Confirm */}
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100">
              <h4 className="font-bold text-xl text-[#0F172A] dark:text-emerald-400">
                Xác Nhận Thu Hoạch Nấm
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Kỹ thuật viên sẽ tiến hành nghiệm thu cân ký, sấy thăng hoa hoặc đóng gói tươi và giao đến địa chỉ đăng ký của bạn.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={() => {
                    triggerSuccessConfetti();
                    setIsHarvested(true);
                    setIsOpen(false);
                  }}
                  className="px-5 py-2 text-sm font-bold bg-[#0D5C3A] text-white rounded-lg shadow transition transform active:scale-95"
                >
                  Xác Nhận Gửi
                </button>
              </div>
            </div>
          </div>
        )}

        {isHarvested && (
          <div className="fixed bottom-6 right-6 bg-emerald-700 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-sm">Gửi yêu cầu thu hoạch thành công!</p>
              <p className="text-xs opacity-90">Kỹ thuật viên trang trại đang tiến hành cắt nấm và nghiệm thu.</p>
            </div>
          </div>
        )}
      </div>

      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />
    </>
  );
}
