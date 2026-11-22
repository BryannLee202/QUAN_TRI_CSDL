'use client';

import React, { useState } from 'react';

interface CheatsheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheatsheetDrawer({ isOpen, onClose }: CheatsheetDrawerProps) {
  const [activeTab, setActiveTab] = useState<'climate' | 'sop' | 'sql'>('climate');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-200">
      <div 
        className="w-full sm:w-[480px] h-full bg-[#FAF7F2] dark:bg-[#1E1B18] shadow-2xl flex flex-col border-l border-[#E0D3C1] dark:border-[#474039] text-[#24170E] dark:text-[#F7EFE6] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#24170E] dark:bg-[#1E1B18] text-[#FFF5EA] flex items-center justify-between border-b border-[#3D281B]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#38261A] flex items-center justify-center text-[#C28E58] border border-[#543825]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E2BA78]">
                Sổ Tay Kỹ Thuật & Cẩm Nang Vận Hành
              </h3>
              <p className="text-[11px] text-[#BFA895]">Tiêu chuẩn thao tác vi khí hậu VietGAP & xử lý sự cố</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#38261A] hover:bg-[#543825] text-[#FFF5EA] flex items-center justify-center text-xs font-bold transition"
            aria-label="Đóng sổ tay"
          >
            ✕
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#E0D3C1] dark:border-[#474039] bg-[#F2EDE4] dark:bg-[#150D07] p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('climate')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'climate'
                ? 'bg-[#C28E58] text-white shadow-xs'
                : 'text-[#6B513E] dark:text-[#B9ADA1] hover:bg-[#EAE0D3] dark:hover:bg-[#3C3630]'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
            </svg>
            <span>Vi Khí Hậu</span>
          </button>
          <button
            onClick={() => setActiveTab('sop')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sop'
                ? 'bg-[#C28E58] text-white shadow-xs'
                : 'text-[#6B513E] dark:text-[#B9ADA1] hover:bg-[#EAE0D3] dark:hover:bg-[#3C3630]'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Quy Trình SOP</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-[#C28E58] text-white shadow-xs'
                : 'text-[#6B513E] dark:text-[#B9ADA1] hover:bg-[#EAE0D3] dark:hover:bg-[#3C3630]'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
            <span>Mã Lỗi CSDL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
          {activeTab === 'climate' && (
            <div className="space-y-3.5">
              <h4 className="font-bold text-[#24170E] dark:text-[#E2BA78] text-sm flex items-center gap-2">
                <span>Ngưỡng Vi Khí Hậu Chuẩn VietGAP Từng Loài</span>
              </h4>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] shadow-2xs space-y-1.5">
                <span className="font-bold text-[#A66C38] dark:text-[#E2BA78] text-xs">
                  1. Đông Trùng Hạ Thảo (Cordyceps militaris)
                </span>
                <ul className="list-disc list-inside text-[#6B513E] dark:text-[#DAC7B5] space-y-1">
                  <li>Nhiệt độ tối ưu: <strong>18°C - 22°C</strong> (Ngưỡng cảnh báo đỏ: &gt; 23.5°C)</li>
                  <li>Độ ẩm không khí: <strong>85% - 92%</strong></li>
                  <li>CO₂: <strong>&lt; 800 ppm</strong> (Đoạn ra mầm quả thể)</li>
                  <li>Ánh sáng LED chuyên dụng: 500 - 1000 lux (chu kỳ 12h sáng / 12h tối)</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] shadow-2xs space-y-1.5">
                <span className="font-bold text-[#8A5C38] dark:text-[#D4AF7A] text-xs">
                  2. Nấm Linh Chi Đỏ Dược Liệu (Ganoderma lucidum)
                </span>
                <ul className="list-disc list-inside text-[#6B513E] dark:text-[#DAC7B5] space-y-1">
                  <li>Nhiệt độ tối ưu: <strong>26°C - 30°C</strong></li>
                  <li>Độ ẩm không khí: <strong>80% - 90%</strong></li>
                  <li>CO₂: 1000 - 1500 ppm (giai đoạn tạo tán xòe sừng hươu)</li>
                  <li>Ánh sáng tán xạ nhẹ 200 - 400 lux</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] shadow-2xs space-y-1.5">
                <span className="font-bold text-[#523522] dark:text-[#C5B09E] text-xs">
                  3. Nấm Bào Ngư Xám Phòng Sạch
                </span>
                <ul className="list-disc list-inside text-[#6B513E] dark:text-[#DAC7B5] space-y-1">
                  <li>Nhiệt độ tối ưu: <strong>24°C - 28°C</strong></li>
                  <li>Độ ẩm không khí: <strong>85% - 95%</strong></li>
                  <li>Lưu lượng gió tươi: quạt đối lưu chạy 15 phút/lần</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="space-y-3.5">
              <h4 className="font-bold text-[#24170E] dark:text-[#E2BA78] text-sm">
                Quy Trình 5 Bước Ứng Phó Sự Cố (SOP Trực Ca)
              </h4>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <p className="text-xs text-[#523522] dark:text-[#DAC7B5]"><strong className="text-[#24170E] dark:text-[#FFF5EA]">Giám sát AlertFeed:</strong> Khi phát hiện cảnh báo đỏ (nhiệt độ tăng cao, độ ẩm tụt), xác định ngay mã Buồng Kính (RoomID).</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <p className="text-xs text-[#523522] dark:text-[#DAC7B5]"><strong className="text-[#24170E] dark:text-[#FFF5EA]">Can thiệp cưỡng bức:</strong> Dùng bảng HardwareControls bật công tắc Quạt hút CO₂ hoặc Máy phun sương bù ẩm.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <p className="text-xs text-[#523522] dark:text-[#DAC7B5]"><strong className="text-[#24170E] dark:text-[#FFF5EA]">Kiểm tra ma trận khay:</strong> Nhấp vào TrayMatrix để kiểm tra xem khay nào đang nuôi nấm trong buồng bị ảnh hưởng.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <p className="text-xs text-[#523522] dark:text-[#DAC7B5]"><strong className="text-[#24170E] dark:text-[#FFF5EA]">Bảo trì / Cách ly:</strong> Nếu khay cần vệ sinh, chuyển trạng thái sang MAINTENANCE để ngăn xếp đơn hàng mới.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039] flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                  <p className="text-xs text-[#523522] dark:text-[#DAC7B5]"><strong className="text-[#24170E] dark:text-[#FFF5EA]">Xử lý hoàn tất:</strong> Nhấn "Đánh dấu đã xử lý" trên cảnh báo sau khi thông số đo lường vi khí hậu trở về ngưỡng xanh an toàn.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3.5">
              <h4 className="font-bold text-[#24170E] dark:text-[#E2BA78] text-sm">
                Tra Cứu Mã Lỗi CSDL T-SQL & Cơ Chế Khóa
              </h4>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039]">
                  <p className="font-bold text-rose-600 dark:text-rose-400">Error 1205: Deadlock Victim</p>
                  <p className="text-[#6B513E] dark:text-[#DAC7B5] font-sans mt-1">Xung đột khóa vòng lặp giữa hai giao dịch đồng thời. Hệ thống tự động ROLLBACK giao dịch ưu tiên thấp và retry.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039]">
                  <p className="font-bold text-amber-600 dark:text-amber-400">Error 2627 / 2601: Duplicate Key Violation</p>
                  <p className="text-[#6B513E] dark:text-[#DAC7B5] font-sans mt-1">Vi phạm ràng buộc UNIQUE (trùng mã khay nuôi, mã hợp đồng thuê hoặc mã QR khay nấm).</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#27231F] border border-[#E0D3C1] dark:border-[#474039]">
                  <p className="font-bold text-[#C28E58] dark:text-[#E2BA78]">Isolation Level: SERIALIZABLE</p>
                  <p className="text-[#6B513E] dark:text-[#DAC7B5] font-sans mt-1">Mức cô lập cao nhất với khoá phạm vi (Range Locks) ngăn ngừa 100% Dirty Read, Non-Repeatable Read và Phantom Read khi phân bổ khay nuôi.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F2EDE4] dark:bg-[#1E1B18] border-t border-[#E0D3C1] dark:border-[#474039] text-center">
          <span className="text-[10px] text-[#8C6D53] dark:text-[#B9ADA1]">
            MushroomCloud Operator Standard Reference • Phiên bản 2.0 (FaaS Platform)
          </span>
        </div>
      </div>
    </div>
  );
}
