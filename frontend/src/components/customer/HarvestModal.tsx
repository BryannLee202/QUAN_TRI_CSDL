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
      <div className="bg-white dark:bg-[#20140D] rounded-2xl p-6 shadow-sm border border-[#E0D3C1] dark:border-[#543825] flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-[#24170E] dark:text-[#E2BA78]">
            🧺 Yêu Cầu Thu Hoạch & Chứng Nhận VietGAP
          </h3>
          <p className="text-xs text-[#735843] dark:text-[#DAC7B5]">
            Khay nấm đã đạt chu kỳ thu hoạch tiêu chuẩn. Xem chứng nhận nguồn gốc hoặc gửi lệnh thu hoạch đến kỹ thuật viên trang trại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsCertOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#FAF5EE] hover:bg-[#F0E6D8] dark:bg-[#2B1C13] dark:hover:bg-[#38261A] text-[#523522] dark:text-[#E2BA78] font-bold text-xs rounded-xl border border-[#C28E58] shadow-sm transition flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            <span>🏆</span>
            <span>Chứng Nhận VietGAP</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(true);
              setErrorMsg(null);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#523522] hover:bg-[#3D2517] text-white font-bold text-xs rounded-xl border-2 border-[#C28E58] shadow-md transition transform active:scale-95 shrink-0 whitespace-nowrap"
          >
            ✨ Gửi Lệnh Thu Hoạch
          </button>
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
                <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs">
                  ⚠️ {errorMsg}
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
          <div className="fixed bottom-6 right-6 bg-[#523522] text-[#FFF7EC] p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce border border-[#C28E58]">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-sm">Gửi yêu cầu thu hoạch thành công (Mã TH: #{harvestData.harvestId})!</p>
              <p className="text-xs opacity-90">Kỹ thuật viên trang trại đã nhận được thông báo thời gian thực trên ma trận.</p>
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