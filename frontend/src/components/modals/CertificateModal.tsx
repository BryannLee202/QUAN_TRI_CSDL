'use client';

import React from 'react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  speciesName?: string;
  trayCode?: string;
  issueDate?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  customerName = 'Lê Minh Tài',
  speciesName = 'Đông Trùng Hạ Thảo (Cordyceps militaris)',
  trayCode = 'TRAY-04 (Nhà Kính Lô A-01)',
  issueDate,
}: CertificateModalProps) {
  if (!isOpen) return null;

  const currentDate = issueDate || new Date().toLocaleDateString('vi-VN');
  const certId = `VN-VIETGAP-2026-MUSHROOM-FARM`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header điều khiển */}
        <div className="px-6 py-3.5 border-b border-[#E0D3C1] dark:border-[#543825] flex items-center justify-between bg-[#FAF5EE] dark:bg-[#20140D]">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="text-sm font-bold text-[#24170E] dark:text-[#FFF5EA]">
              Chứng Nhận Nông Sản Dược Liệu VietGAP & Chuẩn FaaS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#523522] hover:bg-[#3D2517] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs border border-[#C28E58]"
              title="In chứng nhận"
            >
              <svg className="w-4 h-4 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              <span>In Giấy Chứng Nhận</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#FAF5EE] dark:bg-[#2B1C13] hover:bg-[#EAE1D3] dark:hover:bg-[#38261A] text-[#523522] dark:text-[#DAC7B5] flex items-center justify-center text-sm font-bold transition border border-[#DECFC0] dark:border-[#422C1D]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Khung Chứng Nhận In Ấn */}
        <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div className="w-full bg-[#FCFDF9] dark:bg-slate-900 border-4 border-double border-[#D4AF37] rounded-xl p-6 sm:p-8 text-center relative shadow-md text-slate-800 dark:text-slate-100">
            {/* Top Certificate ID */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono border-b border-amber-200 dark:border-slate-800 pb-2 mb-4">
              <span>SỐ HIỆU: {certId}</span>
              <span className="text-[#0D5C3A] dark:text-emerald-400 font-bold">XÁC MINH CƠ SỞ DỮ LIỆU T-SQL 100%</span>
            </div>

            {/* Logo & Quốc hiệu */}
            <div className="mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#EAE1D3] dark:from-[#2B1C13] dark:to-[#170E08] text-[#523522] dark:text-[#E2BA78] flex items-center justify-center mx-auto border-2 border-[#C28E58] shadow-sm mb-2 p-2">
                <svg className="w-full h-full" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="#6B442C" />
                  <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="#C28E58" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="#6B442C" />
                </svg>
              </div>
              <h4 className="text-xs font-bold tracking-widest text-[#0D5C3A] dark:text-emerald-400 uppercase">
                HỆ THỐNG NÔNG TRẠI THÔNG MINH MUSHROOMCLOUD
              </h4>
              <h2 className="text-xl sm:text-2xl font-black text-[#D4AF37] uppercase tracking-wide mt-1">
                GIẤY CHỨNG NHẬN XUẤT XỨ NÔNG SẢN
              </h2>
              <p className="text-xs text-slate-500 italic mt-0.5">
                (Nuôi trồng theo mô hình Farm-as-a-Service kiểm định vi khí hậu 24/7)
              </p>
            </div>

            {/* Nội dung chứng nhận */}
            <div className="my-5 space-y-2 text-xs sm:text-sm">
              <p className="text-slate-600 dark:text-slate-300">Chứng nhận khay nuôi trồng dược liệu của khách hàng:</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0D5C3A] dark:text-emerald-300">
                {customerName}
              </h3>
              <div className="p-3 bg-emerald-50/70 dark:bg-slate-800/80 rounded-xl border border-emerald-100 dark:border-slate-700 max-w-md mx-auto text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giống nấm dược liệu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{speciesName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vị trí khay nuôi:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{trayCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chuẩn canh tác:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">VietGAP & ISO 22000 FaaS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bảo hiểm sản lượng:</span>
                  <span className="font-bold text-amber-600">Cam kết 100% không dư lượng hóa chất</span>
                </div>
              </div>
            </div>

            {/* Chữ ký & Con dấu điện tử */}
            <div className="mt-6 pt-4 border-t border-amber-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="text-left font-mono text-[11px] text-slate-400">
                <p>Ngày cấp: {currentDate}</p>
                <p>Mã QR xác thực: MC-VERIFIED</p>
                <div className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Đã khóa sổ cái giao dịch CSDL</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700 dark:text-slate-200">BAN GIÁM ĐỐC ĐIỀU HÀNH</p>
                <div className="h-10 flex items-center justify-end">
                  <span className="font-serif italic text-amber-600 font-bold text-base">LeMinhTai</span>
                </div>
                <p className="text-[10px] text-slate-400">Ký số điện tử</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
