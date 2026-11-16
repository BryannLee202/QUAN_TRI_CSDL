'use client';

import React, { useState } from 'react';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MarketBatch {
  id: string;
  batchCode: string;
  speciesName: string;
  ownerName: string;
  roomName: string;
  harvestTime: string;
  quantityKg: number;
  pricePerKg: number;
  marketPrice: number;
  category: 'FRESH' | 'DRIED';
  certBadge: string;
  description: string;
}

const MOCK_BATCHES: MarketBatch[] = [
  {
    id: 'b-01',
    batchCode: 'LOT-HT-901',
    speciesName: 'Nấm Hầu Thủ Tươi (Lion\'s Mane)',
    ownerName: 'Lê Minh Tài',
    roomName: 'Buồng Kính RM-01',
    harvestTime: 'Thu hoạch 2 giờ trước',
    quantityKg: 5.2,
    pricePerKg: 240000,
    marketPrice: 310000,
    category: 'FRESH',
    certBadge: 'VietGAP Loại A • ISO Class 5',
    description: 'Nấm vừa hái trực tiếp từ khay #TR-02, cánh nấm dày, cuống mềm ngọt, hàm lượng dinh dưỡng đỉnh cao.',
  },
  {
    id: 'b-02',
    batchCode: 'LOT-BN-902',
    speciesName: 'Nấm Bào Ngư Xám Nhật Tươi',
    ownerName: 'Đặng Văn D.',
    roomName: 'Buồng Kính RM-02',
    harvestTime: 'Thu hoạch sáng nay',
    quantityKg: 8.5,
    pricePerKg: 85000,
    marketPrice: 110000,
    category: 'FRESH',
    certBadge: '100% Organic • Không Thuốc BVTV',
    description: 'Bào ngư xám bung dù chuẩn kích thước 6-8cm, dai giòn tự nhiên, bảo quản mát 4°C nguyên rễ.',
  },
  {
    id: 'b-03',
    batchCode: 'LOT-DT-903',
    speciesName: 'Đông Trùng Hạ Thảo Sấy Thăng Hoa',
    ownerName: 'Trang Trại Trung Tâm FaaS',
    roomName: 'Phòng Sấy Vô Trùng Lab-03',
    harvestTime: 'Đóng gói hút chân không hôm qua',
    quantityKg: 0.25,
    pricePerKg: 890000, // Giá theo hộp 250g
    marketPrice: 1200000,
    category: 'DRIED',
    certBadge: 'Cordycepin > 8.5mg/g • Lọ Thủy Tinh',
    description: 'Đông trùng hạ thảo sấy thăng hoa -45°C giữ nguyên 99% màu vàng cam óng và hoạt chất dược lý.',
  },
  {
    id: 'b-04',
    batchCode: 'LOT-LC-904',
    speciesName: 'Nấm Linh Chi Đỏ Thái Lát Cao Cấp',
    ownerName: 'Nguyễn Thanh Hiền',
    roomName: 'Buồng Kính RM-01',
    harvestTime: 'Thu hoạch tuần này',
    quantityKg: 2.0,
    pricePerKg: 450000,
    marketPrice: 580000,
    category: 'DRIED',
    certBadge: 'Polysaccharides > 42% • Chuẩn Dược',
    description: 'Linh chi đỏ già tuổi viền vàng phấn dày, thái lát sẵn đóng túi zip tiện lợi sắc trà bồi bổ gan.',
  },
];

export default function MarketplaceModal({ isOpen, onClose }: MarketplaceModalProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'FRESH' | 'DRIED' | 'CONSIGN'>('ALL');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredBatches = MOCK_BATCHES.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'FRESH') return b.category === 'FRESH';
    if (activeTab === 'DRIED') return b.category === 'DRIED';
    return true;
  });

  const handleBuy = (batch: MarketBatch) => {
    setPurchaseNotice(`Đã gửi yêu cầu giữ lô nấm ${batch.batchCode} (${batch.speciesName})! Điều phối viên FaaS sẽ liên hệ bạn ngay.`);
    setTimeout(() => setPurchaseNotice(null), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#422C1D] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Sàn Giao Dịch */}
        <div className="px-6 py-4 border-b border-[#EAE1D3] dark:border-[#38261A] flex items-center justify-between bg-gradient-to-r from-[#FAF5EE] via-[#F4ECE1] to-[#FAF5EE] dark:from-[#20140D] dark:to-[#170E08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#523522] text-[#FFF5EA] flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                  Sàn Nông Sản FaaS & Ký Gửi Sau Thu Hoạch
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-700 text-white">
                  P2P Farm Market
                </span>
              </div>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5">
                Kênh kết nối mua bán nấm dược liệu VietGAP trực tiếp từ các khay vừa thu hoạch • Giao hỏa tốc 2 giờ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#543825] text-[#735843] dark:text-[#DAC7B5] hover:text-[#24170E] dark:hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Thông báo đặt hàng nhanh (Toast) */}
        {purchaseNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{purchaseNotice}</span>
          </div>
        )}

        {/* Bộ Lọc Tabs */}
        <div className="px-6 pt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE1D3] dark:border-[#38261A] pb-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF5EE] dark:bg-[#22160E] border border-[#E0D3C1] dark:border-[#38261A] text-xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'ALL'
                  ? 'bg-[#523522] text-white shadow-xs'
                  : 'text-[#735843] dark:text-[#DAC7B5] hover:bg-[#F2E8DC] dark:hover:bg-[#2B1C13]'
              }`}
            >
              Tất Cả Lô Nấm ({MOCK_BATCHES.length})
            </button>
            <button
              onClick={() => setActiveTab('FRESH')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'FRESH'
                  ? 'bg-[#523522] text-white shadow-xs'
                  : 'text-[#735843] dark:text-[#DAC7B5] hover:bg-[#F2E8DC] dark:hover:bg-[#2B1C13]'
              }`}
            >
              Nấm Tươi Mới Hái (2h)
            </button>
            <button
              onClick={() => setActiveTab('DRIED')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'DRIED'
                  ? 'bg-[#523522] text-white shadow-xs'
                  : 'text-[#735843] dark:text-[#DAC7B5] hover:bg-[#F2E8DC] dark:hover:bg-[#2B1C13]'
              }`}
            >
              Sấy Thăng Hoa Cao Cấp
            </button>
          </div>

          <div className="text-xs text-[#8C6D53] dark:text-[#BFA895] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Kiểm dịch VietGAP 100% trước khi xuất kho</span>
          </div>
        </div>

        {/* Danh sách các lô nấm */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="p-5 rounded-3xl bg-[#FAF7F2] dark:bg-[#22160E] border border-[#EAE1D3] dark:border-[#38261A] hover:border-[#C28E58] transition shadow-xs flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#523522] text-[#FFF5EA]">
                        {batch.batchCode}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-[#24170E] dark:text-[#FFF5EA] mt-1.5 group-hover:text-[#C28E58] transition-colors">
                        {batch.speciesName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0">
                      {batch.harvestTime}
                    </span>
                  </div>

                  <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-2 line-clamp-2 leading-relaxed">
                    {batch.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#EAE1D3] dark:border-[#2D1D13] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C6D53] dark:text-[#BFA895] block">Chủ khay ký gửi:</span>
                      <span className="font-semibold text-[#24170E] dark:text-[#FFF5EA]">{batch.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C6D53] dark:text-[#BFA895] block">Khối lượng khả dụng:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{batch.quantityKg} kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE1D3] dark:border-[#2D1D13] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through block">
                      Giá thị trường: {batch.marketPrice.toLocaleString('vi-VN')} đ
                    </span>
                    <div className="flex items-baseline gap-1">
                      <strong className="text-base font-black text-[#523522] dark:text-[#E2BA78]">
                        {batch.pricePerKg.toLocaleString('vi-VN')} đ
                      </strong>
                      <span className="text-[11px] text-[#735843] dark:text-[#DAC7B5]">/ {batch.category === 'DRIED' ? 'hộp' : 'kg'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuy(batch)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#523522] to-[#3B2212] hover:from-[#3D2517] hover:to-[#24140B] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>Mua Lô Này</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Ký Gửi Nấm Thu Hoạch */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FAF5EE] via-[#F4ECE1] to-[#FAF5EE] dark:from-[#20140D] dark:to-[#170E08] border border-[#DECFC0] dark:border-[#543825] flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#24170E] dark:text-[#FFF5EA]">
                  Bạn là người thuê khay nấm và muốn bán lại sản lượng?
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  Hoa Hồng 0%
                </span>
              </div>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5]">
                Đăng ký gửi nấm thu hoạch trực tiếp từ buồng nuôi lên sàn FaaS chỉ với 1 cú click trong Cổng Khách Hàng.
              </p>
            </div>

            <a
              href="/#portal"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#C28E58] hover:bg-[#B37F49] text-white font-bold text-xs shadow-xs transition shrink-0"
            >
              Vào Cổng Khách Hàng Ký Gửi →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
