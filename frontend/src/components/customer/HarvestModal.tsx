'use client';

import React, { useState } from 'react';
import { triggerSuccessConfetti } from '../../utils/confetti';
import CertificateModal from '../modals/CertificateModal';
import { requestHarvestApi, HarvestResponse } from '../../services/api';

export default function HarvestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHarvested, setIsHarvested] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [harvestData, setHarvestData] = useState<HarvestResponse['data'] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await requestHarvestApi({
        orderId: 1,
        deliveryType: 'HOME_DELIVERY',
        deliveryAddress: '123 Đường Nấm Sạch, TP. Hồ Chí Minh',
        notes: 'Thu hoạch đợt 1, đóng gói hút chân không VietGAP',
      });

      triggerSuccessConfetti();
      setHarvestData(res.data);
      setIsHarvested(true);
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi gửi yêu cầu thu hoạch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white/95 dark:bg-[#20140D]/95 rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E0D3C1] dark:border-[#543825] flex flex-col lg:flex-row justify-between items-center gap-6 transition-all w-full">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#F2E8DC] dark:from-[#2B1C13] dark:to-[#1C120B] border border-[#DECFC0] dark:border-[#422C1D] flex items-center justify-center text-[#C28E58] shrink-0 shadow-xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-2">
              <span>Nghiệm Thu Thu Hoạch & Chứng Nhận VietGAP</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#735843] dark:text-[#DAC7B5] leading-relaxed max-w-2xl">
              Khay nấm đã đạt chu kỳ thu hoạch tiêu chuẩn. Xem chứng nhận nguồn gốc xuất xứ hoặc gửi lệnh thu hoạch đến kỹ thuật viên trang trại.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0 justify-end">
          <button
            onClick={() => setIsCertOpen(true)}
            className="w-full sm:w-auto px-5 py-3 bg-[#FAF5EE] hover:bg-[#F2E8DC] dark:bg-[#2B1C13] dark:hover:bg-[#3D261A] text-[#523522] dark:text-[#E2BA78] font-bold text-xs rounded-xl border border-[#C28E58] shadow-xs transition flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <span>Chứng Nhận VietGAP</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(true);
              setErrorMsg(null);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#523522] to-[#361F12] hover:from-[#3D2517] hover:to-[#24140B] text-white font-bold text-xs rounded-xl border border-[#C28E58] shadow-md transition transform active:scale-95 shrink-0 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Gửi Lệnh Thu Hoạch</span>
          </button>
        </div>
      </div>

        {/* Modal Popup Confirm */}
        {isOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1C120C] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E0D3C1] dark:border-[#543825] text-[#24170E] dark:text-[#F7EFE6]">
              <h4 className="font-bold text-xl text-[#24170E] dark:text-[#E2BA78]">
                Xác Nhận Thu Hoạch Nấm
              </h4>
              <p className="text-sm text-[#634936] dark:text-[#DAC7B5]">
                Hệ thống sẽ thực thi thủ tục <code>sp_RequestHarvest</code> trong CSDL, thông báo ngay lập tức qua WebSocket đến màn hình Kỹ thuật viên trang trại để nghiệm thu cân ký và giao tận nơi.
              </p>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-[#8C6D53] hover:bg-[#FAF5EE] dark:hover:bg-[#281A12] rounded-lg transition disabled:opacity-50"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmHarvest}
                  disabled={loading}
                  className="px-5 py-2 text-sm font-bold bg-[#523522] hover:bg-[#3D2517] text-white rounded-lg shadow transition transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Đang gửi lệnh CSDL...' : 'Xác Nhận Gửi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isHarvested && harvestData && (
          <div className="fixed bottom-6 right-6 bg-[#4A2E1D] text-[#FFF7EC] p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-[#C28E58]">
            <div className="w-8 h-8 rounded-xl bg-[#6B442C] flex items-center justify-center text-[#E2BA78] shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <p className="font-bold text-sm">Gửi yêu cầu thu hoạch thành công (Mã TH: #{harvestData.harvestId})!</p>
              <p className="text-xs text-[#EADCC8]">Kỹ thuật viên trang trại đã nhận được thông báo thời gian thực trên ma trận.</p>
            </div>
          </div>
        )}

      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />
    </>
  );
}