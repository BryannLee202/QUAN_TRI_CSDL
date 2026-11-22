'use client';

import React, { useState } from 'react';

interface FarmNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FarmHub {
  id: string;
  name: string;
  city: string;
  address: string;
  chambers: number;
  totalTrays: number;
  activeRate: number;
  specialty: string;
  deliverySpeed: string;
  status: 'ACTIVE' | 'EXPANDING';
  tags: string[];
}

const FARM_HUBS: FarmHub[] = [
  {
    id: 'hub-hcm',
    name: 'Hub Công Nghệ Cao TP.HCM (Thủ Đức)',
    city: 'TP. Hồ Chí Minh',
    address: 'Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM',
    chambers: 64,
    totalTrays: 2560,
    activeRate: 98,
    specialty: 'Nấm Hầu Thủ (Lion\'s Mane) & Bào Ngư Xám',
    deliverySpeed: 'Giao hỏa tốc 30 - 60 phút',
    status: 'ACTIVE',
    tags: ['ISO Class 5', 'IoT Gateway LoRaWAN', 'Camera PTZ 4K'],
  },
  {
    id: 'hub-dalat',
    name: 'Trại Nấm Cao Nguyên Đà Lạt',
    city: 'Lâm Đồng',
    address: 'Thung Lũng Trại Mát, Phường 11, TP. Đà Lạt, Tỉnh Lâm Đồng',
    chambers: 128,
    totalTrays: 5120,
    activeRate: 94,
    specialty: 'Đông Trùng Hạ Thảo Sinh Khối & Linh Chi Đỏ',
    deliverySpeed: 'Đóng thùng lạnh bảo quản 4°C',
    status: 'ACTIVE',
    tags: ['Khí Hậu Ôn Đới 18-22°C', 'Sấy Thăng Hoa Vô Trùng', 'Chuẩn Dược Liệu'],
  },
  {
    id: 'hub-dongnai',
    name: 'Hub Nông Nghiệp Khép Kín Long Khánh',
    city: 'Đồng Nai',
    address: 'Khu Nông Nghiệp Ứng Dụng Công Nghệ Cao, TP. Long Khánh, Tỉnh Đồng Nai',
    chambers: 96,
    totalTrays: 3840,
    activeRate: 88,
    specialty: 'Nấm Bào Ngư Thương Phẩm & Nấm Hoàng Kim',
    deliverySpeed: 'Cung ứng sỉ cho chuỗi siêu thị',
    status: 'ACTIVE',
    tags: ['Năng Suất Quy Mô Lớn', 'Đối Lưu Không Khí 2 Chiều', 'VietGAP'],
  },
  {
    id: 'hub-cantho',
    name: 'Trạm Sinh Học Vô Trùng Cần Thơ',
    city: 'Cần Thơ',
    address: 'Khu Nông Nghiệp Công Nghệ Cao, Q. Thốt Nốt, TP. Cần Thơ',
    chambers: 32,
    totalTrays: 1280,
    activeRate: 75,
    specialty: 'Khảo nghiệm giống nấm dược liệu nhiệt đới',
    deliverySpeed: 'Phục vụ Tây Nam Bộ trong ngày',
    status: 'EXPANDING',
    tags: ['Mở Rộng Giai Đoạn 2', 'Nghiên Cứu Giống', 'CSDL Đồng Bộ'],
  },
];

export default function FarmNetworkModal({ isOpen, onClose }: FarmNetworkModalProps) {
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-hcm');

  if (!isOpen) return null;

  const currentHub = FARM_HUBS.find((h) => h.id === selectedHubId) || FARM_HUBS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1E1B18] border border-[#DECFC0] dark:border-[#474039] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#EAE1D3] dark:border-[#474039] flex items-center justify-between bg-gradient-to-r from-[#FAF5EE] via-[#F4ECE1] to-[#FAF5EE] dark:from-[#20140D] dark:to-[#1E1B18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#523522] text-[#FFF5EA] flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                  Mạng Lưới Trang Trại Buồng Nuôi Phân Tán Chuẩn ISO
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#523522] text-[#FFF5EA]">
                  Distributed FaaS Hubs
                </span>
              </div>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5">
                Các cụm buồng nuôi cấy phòng sạch điều khiển bằng IoT trên khắp cả nước • Cam kết giao nấm tươi trong 2 giờ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] text-[#735843] dark:text-[#DAC7B5] hover:text-[#24170E] dark:hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* 4 Thẻ Thống Kê Tổng Quan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-[#EAE1D3] dark:border-[#474039] bg-[#FAF7F2] dark:bg-[#27231F]">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6D53] dark:text-[#BFA895] block">Tổng Buồng Kính</span>
            <strong className="text-lg font-black text-[#523522] dark:text-[#E2BA78]">320+ Buồng</strong>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Chuẩn ISO Class 5</span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6D53] dark:text-[#BFA895] block">Công Suất Khay</span>
            <strong className="text-lg font-black text-[#523522] dark:text-[#E2BA78]">12.800 Khay</strong>
            <span className="text-[10px] text-[#8C6D53] block mt-0.5">Vận hành tự động</span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6D53] dark:text-[#BFA895] block">Giao Hàng Hỏa Tốc</span>
            <strong className="text-lg font-black text-amber-700 dark:text-amber-400">2 Giờ</strong>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 block mt-0.5">Sau khi bấm thu hoạch</span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6D53] dark:text-[#BFA895] block">Uptime Vi Khí Hậu</span>
            <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400">99.98%</strong>
            <span className="text-[10px] text-emerald-700 block mt-0.5">SQL Telemetry Sync</span>
          </div>
        </div>

        {/* Thân Modal 2 Cột */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột Trái: Danh sách các Hub (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#523522] dark:text-[#DAC7B5]">
              Chọn Cơ Sở Trang Trại FaaS
            </h4>
            <div className="space-y-2">
              {FARM_HUBS.map((hub) => {
                const isSelected = hub.id === selectedHubId;
                return (
                  <button
                    key={hub.id}
                    onClick={() => setSelectedHubId(hub.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#C28E58] bg-[#FAF5EE] dark:bg-[#322D28] shadow-sm ring-1 ring-[#C28E58]'
                        : 'border-[#E0D3C1] dark:border-[#474039] hover:bg-[#FAF7F2] dark:hover:bg-[#22160E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">
                        {hub.name}
                      </strong>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        hub.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                      }`}>
                        {hub.status === 'ACTIVE' ? 'Đang Chạy' : 'Giai Đoạn 2'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8C6D53] dark:text-[#BFA895] mt-1 line-clamp-1">
                      {hub.address}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#EAE1D3] dark:border-[#474039] flex items-center justify-between text-[11px]">
                      <span className="text-[#6E4B33] dark:text-[#DAC7B5]">Quy mô:</span>
                      <span className="font-semibold text-[#24170E] dark:text-[#FFF5EA]">
                        {hub.chambers} buồng ({hub.totalTrays} khay)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột Phải: Chi tiết Hub & Bản đồ mô phỏng (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl bg-[#FAF5EE] dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#523522] text-[#FFF5EA]">
                    {currentHub.city}
                  </span>
                  <h3 className="font-black text-base text-[#24170E] dark:text-[#FFF5EA] mt-1.5">
                    {currentHub.name}
                  </h3>
                  <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5">
                    📍 {currentHub.address}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8C6D53] dark:text-[#BFA895] block">Tải Buồng Nuôi:</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {currentHub.activeRate}%
                  </span>
                </div>
              </div>

              {/* Thông số kỹ thuật chuyên canh */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#EAE1D3] dark:border-[#474039] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#BFA895]">Chủng nấm chuyên canh:</span>
                  <strong className="text-[#24170E] dark:text-[#FFF5EA]">{currentHub.specialty}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C6D53] dark:text-[#BFA895]">Thời gian giao hàng:</span>
                  <strong className="text-amber-700 dark:text-amber-400 font-semibold">{currentHub.deliverySpeed}</strong>
                </div>
              </div>

              {/* Tags Công Nghệ */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentHub.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] text-[10px] font-semibold text-[#6E4B33] dark:text-[#E2BA78]"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Khung Cam Kết Dịch Vụ Nông Nghiệp Khép Kín */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2B1C13] to-[#1C120C] text-[#FFF5EA] border border-[#543825] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <strong className="text-xs font-bold text-white block">
                  Bạn muốn chọn khay nuôi cấy tại {currentHub.city}?
                </strong>
                <p className="text-[11px] text-[#DAC7B5]">
                  Hệ thống tự động điều phối khay nấm của bạn vào cơ sở gần nhất để tối ưu thời gian nhận nấm tươi.
                </p>
              </div>
              <a
                href="/#packages"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#C28E58] hover:bg-[#B37F49] text-white font-bold text-xs shadow-xs transition shrink-0"
              >
                Thuê Khay Tại Đây →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
