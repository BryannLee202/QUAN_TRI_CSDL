'use client';

import React, { useState } from 'react';

interface CheatsheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheatsheetDrawer({ isOpen, onClose }: CheatsheetDrawerProps) {
  const [activeTab, setActiveTab] = useState<'climate' | 'sop' | 'sql'>('climate');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:w-[460px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="text-sm font-bold text-[#D4AF37]">
                Sổ Tay Kỹ Thuật & Cẩm Nang Vận Hành
              </h3>
              <p className="text-[11px] text-slate-400">Chuẩn hóa thao tác cho kỹ thuật viên & trực ca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('climate')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'climate'
                ? 'bg-[#0D5C3A] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🌡️ Vi Khí Hậu
          </button>
          <button
            onClick={() => setActiveTab('sop')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'sop'
                ? 'bg-[#0D5C3A] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🚨 Quy Trình SOP
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'sql'
                ? 'bg-[#0D5C3A] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💾 Mã Lỗi CSDL
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
          {activeTab === 'climate' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-emerald-400 text-sm">
                Ngưỡng Vi Khí Hậu Chuẩn VietGAP Từng Loài
              </h4>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  1. Đông Trùng Hạ Thảo (Cordyceps)
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                  <li>Nhiệt độ tối ưu: <strong>18°C - 22°C</strong> (Cảnh báo đỏ: &gt; 23.5°C)</li>
                  <li>Độ ẩm không khí: <strong>85% - 92%</strong></li>
                  <li>CO2: <strong>&lt; 800 ppm</strong> (Đoạn ra mầm)</li>
                  <li>Ánh sáng: 500 - 1000 lux (12h sáng / 12h tối)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  2. Nấm Linh Chi Đỏ (Reishi)
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                  <li>Nhiệt độ tối ưu: <strong>26°C - 30°C</strong></li>
                  <li>Độ ẩm không khí: <strong>80% - 90%</strong></li>
                  <li>CO2: 1000 - 1500 ppm (giai đoạn tạo sừng hươu)</li>
                  <li>Ánh sáng tán xạ nhẹ 200 - 400 lux</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">
                  3. Nấm Mối Đen & Bào Ngư
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                  <li>Nhiệt độ tối ưu: <strong>24°C - 28°C</strong></li>
                  <li>Độ ẩm không khí: <strong>85% - 95%</strong></li>
                  <li>Thông thoáng khí liên tục, quạt đối lưu 15 phút/lần</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-emerald-400 text-sm">
                Quy Trình 5 Bước Ứng Phó Sự Cố (SOP)
              </h4>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center shrink-0">1</span>
                  <p><strong>Giám sát AlertFeed:</strong> Khi phát hiện cảnh báo đỏ (Vượt nhiệt độ, độ ẩm tụt), xác định ngay mã Buồng Kính (RoomID).</p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">2</span>
                  <p><strong>Kích hoạt phần cứng cưỡng bức:</strong> Dùng bảng HardwareControls bật công tắc Rèm làm mát hoặc Bơm sương siêu âm.</p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                  <p><strong>Kiểm tra trạng thái khay:</strong> Click vào ma trận khay (TrayMatrix) kiểm tra các khay đang nuôi trong buồng có dấu hiệu nhiễm nấm mốc không.</p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">4</span>
                  <p><strong>Cách ly nếu có khay bệnh:</strong> Đổi trạng thái khay sang ISOLATED để kích hoạt bảo hiểm đền bù tự động cho khách.</p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">5</span>
                  <p><strong>Xử lý hoàn tất (Resolve):</strong> Nhấn nút "Xử lý xong" trên cảnh báo sau khi thông số đo lường thực tế trở về dải xanh.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-emerald-400 text-sm">
                Tra Cứu Mã Lỗi CSDL T-SQL & Giao Dịch
              </h4>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-red-600 dark:text-red-400">Error 1205: Deadlock Victim</p>
                  <p className="text-slate-600 dark:text-slate-300 font-sans mt-0.5">Xung đột khóa vòng tròn giữa 2 giao dịch. Hệ thống tự động ROLLBACK giao dịch ưu tiên thấp.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-amber-600 dark:text-amber-400">Error 2627 / 2601: Duplicate Key Violation</p>
                  <p className="text-slate-600 dark:text-slate-300 font-sans mt-0.5">Vi phạm ràng buộc UNIQUE (trùng mã khay, mã hợp đồng thuê hoặc mã QR).</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-blue-600 dark:text-blue-400">Isolation Level: SERIALIZABLE</p>
                  <p className="text-slate-600 dark:text-slate-300 font-sans mt-0.5">Mức cô lập cao nhất, sử dụng khóa phạm vi (Range Locks) ngăn ngừa 100% Dirty Read, Non-Repeatable Read và Phantom Read.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-400">
            MushroomCloud Operator Standard Reference • v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
