'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
    speciesName: "Nấm Hầu Thủ Tươi (Lion's Mane)",
    ownerName: 'Lê Minh Tài',
    roomName: 'Buồng Kính RM-01 (Khu CNC Thủ Đức)',
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
    roomName: 'Buồng Kính RM-02 (Long Khánh)',
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
    roomName: 'Phòng Sấy Vô Trùng Lab-03 (Đà Lạt)',
    harvestTime: 'Đóng gói hút chân không hôm qua',
    quantityKg: 1.2,
    pricePerKg: 18500000,
    marketPrice: 24000000,
    category: 'DRIED',
    certBadge: 'Dược Điển VN • Cordycepin > 0.8%',
    description: 'Đông trùng hạ thảo sấy thăng hoa -45°C giữ nguyên 99% màu vàng cam óng và hoạt chất dược lý.',
  },
  {
    id: 'b-04',
    batchCode: 'LOT-LC-904',
    speciesName: 'Nấm Linh Chi Đỏ Thái Lát Cao Cấp',
    ownerName: 'Nguyễn Thanh H.',
    roomName: 'Buồng Nuôi Dược Liệu RM-04 (Cần Thơ)',
    harvestTime: 'Thu hoạch tuần này',
    quantityKg: 3.0,
    pricePerKg: 850000,
    marketPrice: 1150000,
    category: 'DRIED',
    certBadge: 'Polysaccharide > 42% • VietGAP',
    description: 'Linh chi đỏ già tuổi viền vàng phấn dày, thái lát sẵn đóng túi zip tiện lợi nấu trà bồi bổ gan.',
  },
  {
    id: 'b-05',
    batchCode: 'LOT-HK-905',
    speciesName: 'Nấm Hoàng Kim Tươi Hữu Cơ',
    ownerName: 'Võ Duy T.',
    roomName: 'Buồng Nuôi Khép Kín RM-03 (Thủ Đức)',
    harvestTime: 'Thu hoạch 4 giờ trước',
    quantityKg: 4.0,
    pricePerKg: 130000,
    marketPrice: 175000,
    category: 'FRESH',
    certBadge: 'VietGAP Chuẩn Sạch',
    description: 'Màu vàng hoàng kim rực rỡ, vị ngọt thanh mát, giàu vitamin nhóm B và chất xơ hòa tan.',
  },
  {
    id: 'b-06',
    batchCode: 'LOT-CK-906',
    speciesName: 'Nấm Cẩm Thạch Trắng (White Shimeji)',
    ownerName: 'Hoàng H.',
    roomName: 'Buồng Kính RM-05 (Long Khánh)',
    harvestTime: 'Thu hoạch 1 giờ trước',
    quantityKg: 6.0,
    pricePerKg: 120000,
    marketPrice: 160000,
    category: 'FRESH',
    certBadge: 'ISO Class 5 • Thân Giòn Ngọt',
    description: 'Nấm Shimeji trắng muốt, thân nhỏ chắc nịch, dai giòn đậm vị, nấu lẩu hoặc xào tỏi cực ngon.',
  },
];

export default function MarketplacePage() {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'FRESH' | 'DRIED'>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<MarketBatch | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredBatches = MOCK_BATCHES.filter((b) => {
    const matchesCategory = filterCategory === 'ALL' || b.category === filterCategory;
    const matchesSearch =
      b.speciesName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.batchCode.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  const handleBuy = (batch: MarketBatch) => {
    setSelectedBatch(batch);
  };

  const confirmOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedBatch(null);
    }, 4000);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Banner Header */}
        <div className="bg-gradient-to-b from-[#F5EEE4] via-[#FBF7F0] to-[#FDFBF8] dark:from-[#20140D] dark:via-[#19100A] dark:to-[#140D08] border-b border-[#EAE1D3] dark:border-[#38261A] py-10 px-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A5C38] dark:text-[#C28E58]">
              <Link href="/" className="hover:underline flex items-center gap-1">
                <span>← Trang Chủ</span>
              </Link>
              <span>/</span>
              <span className="text-[#3B2212] dark:text-[#FFF5EA]">Thương Mại Nông Sản</span>
              <span>/</span>
              <span className="text-[#C28E58] font-bold">Sàn Nông Sản FaaS</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-900 dark:text-emerald-300 text-xs font-bold mb-2">
                  <span>🥬 SÀN GIAO DỊCH NÔNG SẢN TƯƠI SẠCH P2P</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#24170E] dark:text-white tracking-tight">
                  Sàn Nông Sản FaaS &amp; Ký Gửi Thu Hoạch
                </h1>
                <p className="text-sm sm:text-base text-[#6E4B33] dark:text-[#DAC7B5] mt-2 max-w-2xl leading-relaxed">
                  Mua trực tiếp các lô nấm tươi hữu cơ vừa hái từ buồng kính công nghệ cao hoặc ký gửi nấm dư thừa sau thu hoạch để quy đổi ra tiền mặt với giá niêm yết minh bạch.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/tinh-loi-nhuan"
                  className="px-4 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#422C1D] bg-white dark:bg-[#1C120C] text-xs font-bold hover:border-[#C28E58] transition"
                >
                  Tính Lợi Nhuận Thuê Khay →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê nhanh & Bộ Lọc */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-lg">
                ⚡
              </div>
              <div>
                <span className="text-[11px] text-[#8C6D53] block">Giao hàng hỏa tốc:</span>
                <span className="font-black text-sm text-[#24170E] dark:text-[#FFF5EA]">30 - 60 Phút Nội Thành</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-lg">
                🏷️
              </div>
              <div>
                <span className="text-[11px] text-[#8C6D53] block">Tiết kiệm trung bình:</span>
                <span className="font-black text-sm text-[#C28E58]">Rẻ Hơn Thị Trường 20 - 30%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center text-lg">
                🛡️
              </div>
              <div>
                <span className="text-[11px] text-[#8C6D53] block">Chứng thực nguồn gốc:</span>
                <span className="font-black text-sm text-[#24170E] dark:text-[#FFF5EA]">Mã QR VietGAP Mỗi Lô</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#38261A] mb-8 shadow-xs">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterCategory === 'ALL'
                    ? 'bg-[#523522] dark:bg-[#C28E58] text-white dark:text-[#170E08] shadow-sm'
                    : 'text-[#6E4B33] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#25170F]'
                }`}
              >
                Tất Cả Lô Nấm ({MOCK_BATCHES.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('FRESH')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterCategory === 'FRESH'
                    ? 'bg-[#523522] dark:bg-[#C28E58] text-white dark:text-[#170E08] shadow-sm'
                    : 'text-[#6E4B33] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#25170F]'
                }`}
              >
                <span>🌿 Nấm Tươi Hỏa Tốc (2H)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('DRIED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterCategory === 'DRIED'
                    ? 'bg-[#523522] dark:bg-[#C28E58] text-white dark:text-[#170E08] shadow-sm'
                    : 'text-[#6E4B33] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#25170F]'
                }`}
              >
                <span>☀️ Sấy Thăng Hoa &amp; Dược Liệu</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Tìm giống nấm, mã lô..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 rounded-xl border border-[#DECFC0] dark:border-[#422C1D] bg-[#FAF5EE] dark:bg-[#20140D] text-xs text-[#24170E] dark:text-white placeholder-[#8A5C38] focus:outline-none focus:border-[#C28E58]"
              />
              <span className="absolute left-3 top-2.5 text-xs text-[#8A5C38]">🔍</span>
            </div>
          </div>

          {/* Grid Lô Nấm */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => {
              const savePercent = Math.round(
                ((batch.marketPrice - batch.pricePerKg) / batch.marketPrice) * 100
              );
              return (
                <div
                  key={batch.id}
                  className="rounded-3xl border border-[#DECFC0] dark:border-[#38261A] bg-white dark:bg-[#1A1009] p-6 shadow-sm hover:shadow-md hover:border-[#C28E58] transition flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Header Card */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#FAF5EE] dark:bg-[#25170F] text-[#8A5C38] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#38261A]">
                        {batch.batchCode}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {batch.harvestTime}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#24170E] dark:text-[#FFF5EA] group-hover:text-[#C28E58] transition">
                        {batch.speciesName}
                      </h3>
                      <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1 leading-relaxed line-clamp-2">
                        {batch.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-[#8A5C38] space-y-1 bg-[#FAF5EE] dark:bg-[#22160E] p-3 rounded-xl border border-[#EAE1D3] dark:border-[#332014]">
                      <div className="flex items-center justify-between">
                        <span>Chủ khay ký gửi:</span>
                        <span className="font-bold text-[#3B2212] dark:text-white">{batch.ownerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Vị trí buồng nuôi:</span>
                        <span className="text-[#6E4B33] dark:text-[#DAC7B5] truncate max-w-[170px]">{batch.roomName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Chứng nhận:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{batch.certBadge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Giá & Action */}
                  <div className="mt-6 pt-4 border-t border-[#EAE1D3] dark:border-[#332014] flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-[#8C6D53] line-through block">
                        Giá TT: {formatVnd(batch.marketPrice)}/kg
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-[#24170E] dark:text-[#FFF5EA]">
                          {formatVnd(batch.pricePerKg)}
                        </span>
                        <span className="text-xs text-[#8A5C38]">/kg</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Tiết kiệm {savePercent}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(batch)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#523522] to-[#361F12] dark:from-[#C28E58] dark:to-[#9E6845] text-white dark:text-[#170E08] font-bold text-xs shadow-sm hover:shadow transition"
                    >
                      Mua Lô Này →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Xác Nhận Mua Hàng */}
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#4A3222] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF5EE] dark:bg-[#281A12] text-[#8A5C38] flex items-center justify-center font-bold hover:text-black dark:hover:text-white"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-bold text-[#C28E58] uppercase">Xác Nhận Đặt Mua Lô Nông Sản</span>
                <h3 className="text-xl font-black text-[#24170E] dark:text-[#FFF5EA] mt-1">
                  {selectedBatch.speciesName}
                </h3>
                <p className="text-xs text-[#735843] dark:text-[#BFA895]">
                  Mã lô: <span className="font-mono font-bold">{selectedBatch.batchCode}</span> • {selectedBatch.certBadge}
                </p>
              </div>

              {orderSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-center space-y-2">
                  <div className="text-3xl">🎉</div>
                  <h4 className="font-black text-base">Đặt Hàng Thành Công!</h4>
                  <p className="text-xs">
                    Đơn hàng đã được điều phối đến Hub gần nhất. Shipper chuyên biệt sẽ giao tận nơi bảo quản lạnh trong vòng 45 phút.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#22160E] space-y-2 text-xs border border-[#EAE1D3] dark:border-[#38261A]">
                    <div className="flex items-center justify-between">
                      <span>Khối lượng lô:</span>
                      <span className="font-bold">{selectedBatch.quantityKg} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Đơn giá FaaS:</span>
                      <span className="font-bold">{formatVnd(selectedBatch.pricePerKg)}/kg</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE1D3] dark:border-[#38261A]">
                      <span className="font-bold text-sm">Tổng thanh toán:</span>
                      <span className="font-black text-base text-[#C28E58]">
                        {formatVnd(selectedBatch.quantityKg * selectedBatch.pricePerKg)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={confirmOrder}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C28E58] to-[#9E6845] text-[#170E08] font-black text-sm shadow-md hover:shadow-lg transition text-center"
                    >
                      Xác Nhận Giao Hỏa Tốc Tận Nơi →
                    </button>
                    <p className="text-[11px] text-center text-[#8A5C38]">
                      Kiểm tra nấm trước khi nhận • Miễn phí vận chuyển cho đơn hàng đầu tiên
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
