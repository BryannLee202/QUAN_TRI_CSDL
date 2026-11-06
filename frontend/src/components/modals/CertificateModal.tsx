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
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Chứng Nhận Nông Sản Dược Liệu VietGAP & Chuẩn FaaS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#0D5C3A] hover:bg-[#0a462c] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="In chứng nhận"
            >
              <span>🖨️</span>
              <span>In Giấy Chứng Nhận</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition"
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
              <div className="w-14 h-14 rounded-full bg-[#0D5C3A] text-white flex items-center justify-center mx-auto text-2xl border-2 border-[#D4AF37] shadow-inner mb-2">
                🍄
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
                <div className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span>🔒</span> Đã khóa sổ cái giao dịch CSDL
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
