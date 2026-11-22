'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CheckoutGatewayModal, { CheckoutItemConfig } from '@/components/checkout/CheckoutGatewayModal';

interface MushroomSpec {
  id: string;
  name: string;
  scientificName: string;
  badge: string;
  cycleDays: number;
  yieldPerTrayKg: number;
  marketPricePerKg: number;
  monthlyRentalPrice: number;
  benefits: string;
  color: string;
}

const SPECIES_OPTIONS: MushroomSpec[] = [
  {
    id: 'oyster',
    name: 'Nấm Bào Ngư Xám Nhật',
    scientificName: 'Pleurotus ostreatus',
    badge: 'Năng Suất Cao • Phổ Thông',
    cycleDays: 30,
    yieldPerTrayKg: 3.5,
    marketPricePerKg: 110000,
    monthlyRentalPrice: 299000,
    benefits: 'Giàu protein thực vật, hạ cholesterol, chu kỳ sinh trưởng cực nhanh 30 ngày.',
    color: '#8A5C38',
  },
  {
    id: 'lions_mane',
    name: "Nấm Hầu Thủ (Lion's Mane)",
    scientificName: 'Hericium erinaceus',
    badge: 'Dược Liệu Não Bộ • Bán Chạy',
    cycleDays: 45,
    yieldPerTrayKg: 2.6,
    marketPricePerKg: 290000,
    monthlyRentalPrice: 399000,
    benefits: 'Tăng sinh tế bào thần kinh NGF, cải thiện trí nhớ, hương vị thượng hạng như thịt tôm hùm.',
    color: '#C28E58',
  },
  {
    id: 'reishi',
    name: 'Nấm Linh Chi Đỏ Dược Liệu',
    scientificName: 'Ganoderma lucidum',
    badge: 'Thảo Dược Bổ Gan • Giá Trị Cao',
    cycleDays: 75,
    yieldPerTrayKg: 1.8,
    marketPricePerKg: 520000,
    monthlyRentalPrice: 499000,
    benefits: 'Hàm lượng Polysaccharide > 40%, tăng miễn dịch, giải độc gan và chống lão hóa tế bào.',
    color: '#9E3824',
  },
  {
    id: 'cordyceps',
    name: 'Đông Trùng Hạ Thảo Sinh Khối',
    scientificName: 'Cordyceps militaris',
    badge: 'Thượng Phẩm Bồi Bổ • ROI Tối Đa',
    cycleDays: 60,
    yieldPerTrayKg: 0.9,
    marketPricePerKg: 1350000,
    monthlyRentalPrice: 599000,
    benefits: 'Giàu Cordycepin và Adenosine nguyên chất, bổ phổi, phục hồi thể lực chuyên sâu.',
    color: '#D97706',
  },
];

const DURATION_OPTIONS = [
  { months: 1, label: '1 Tháng', discount: 0, tag: 'Tiêu chuẩn' },
  { months: 3, label: '3 Tháng', discount: 0.05, tag: 'Giảm 5%' },
  { months: 6, label: '6 Tháng', discount: 0.10, tag: 'Giảm 10%' },
  { months: 12, label: '12 Tháng', discount: 0.18, tag: 'Giảm 18% • VIP' },
];

export default function RoiCalculatorPage() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('lions_mane');
  const [trayCount, setTrayCount] = useState<number>(3);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [isSuccessBooked, setIsSuccessBooked] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItemConfig | null>(null);
  const [ledgerRefresh, setLedgerRefresh] = useState<number>(0);

  const selectedSpecies = useMemo(
    () => SPECIES_OPTIONS.find((s) => s.id === selectedSpeciesId) || SPECIES_OPTIONS[0],
    [selectedSpeciesId]
  );

  const selectedDuration = useMemo(
    () => DURATION_OPTIONS.find((d) => d.months === durationMonths) || DURATION_OPTIONS[0],
    [durationMonths]
  );

  // Tính toán số liệu tài chính & sản lượng
  const calculations = useMemo(() => {
    const rawCost = selectedSpecies.monthlyRentalPrice * trayCount * durationMonths;
    const totalCost = Math.round(rawCost * (1 - selectedDuration.discount));
    const totalDays = durationMonths * 30;
    const cycles = Math.max(1, Math.floor(totalDays / selectedSpecies.cycleDays));
    const totalYieldKg = Number((cycles * selectedSpecies.yieldPerTrayKg * trayCount).toFixed(1));
    const totalMarketValue = Math.round(totalYieldKg * selectedSpecies.marketPricePerKg);
    const netProfit = totalMarketValue - totalCost;
    const roiPercentage = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

    return {
      totalCost,
      rawCost,
      discountAmount: rawCost - totalCost,
      cycles,
      totalYieldKg,
      totalMarketValue,
      netProfit,
      roiPercentage,
    };
  }, [selectedSpecies, trayCount, durationMonths, selectedDuration]);

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  const handleBooking = () => {
    const pkgId =
      selectedSpecies.id === 'oyster'
        ? 1
        : selectedSpecies.id === 'reishi'
        ? 2
        : 3;

    setCheckoutItem({
      orderType: 'FAAS_RENTAL',
      packageId: pkgId,
      itemName: `${selectedSpecies.name} (${trayCount} Khay • ${durationMonths} Tháng)`,
      subtitle: `${selectedSpecies.scientificName} • Dự kiến ${calculations.cycles} đợt thu hoạch`,
      grossAmount: calculations.totalCost,
      durationLabel: `${durationMonths * 30} Ngày`,
      yieldCommitment: `~${calculations.totalYieldKg} kg`,
    });
  };

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Breadcrumb & Hero Header */}
        <div className="bg-gradient-to-b from-[#F5EEE4] via-[#FBF7F0] to-[#FDFBF8] dark:from-[#20140D] dark:via-[#19100A] dark:to-[#140D08] border-b border-[#EAE1D3] dark:border-[#474039] py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#24170E] dark:text-white tracking-tight">
                  Máy Tính Lợi Nhuận &amp; Sản Lượng FaaS
                </h1>
                <p className="text-sm sm:text-base text-[#6E4B33] dark:text-[#DAC7B5] mt-2 max-w-2xl leading-relaxed">
                  Dự phóng chính xác sản lượng nấm tươi hữu cơ chuẩn VietGAP thu hoạch được, giá trị thị trường và tỷ suất sinh lời khi thuê khay nấm trực tuyến qua nền tảng MushroomCloud.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/san-nong-san"
                  className="px-4 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#474039] bg-white dark:bg-[#27231F] text-xs font-bold hover:border-[#C28E58] transition"
                >
                  Tham Khảo Sàn Nông Sản →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Nội Dung Tính Toán Chính */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          {isSuccessBooked && (
            <div className="mb-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-bold text-sm">Đã khởi tạo gói thuê thành công!</p>
                  <p className="text-xs">Hệ thống đã lưu thông tin tính toán của bạn. Chuyên viên nông nghiệp FaaS sẽ kết nối với bạn qua điện thoại trong 15 phút.</p>
                </div>
              </div>
              <button onClick={() => setIsSuccessBooked(false)} className="text-xs font-bold underline">
                Đóng
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột Trái (8 Cột): Chọn Giống Nấm, Số Khay, Thời Hạn */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Mục 1: Chọn Chủng Nấm Dược Liệu */}
              <div className="bg-white dark:bg-[#1E1B18] p-6 sm:p-8 rounded-3xl border border-[#DECFC0] dark:border-[#474039] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#523522] text-white flex items-center justify-center text-xs">1</span>
                      <span>Chọn Chủng Nấm Nuôi Trồng FaaS</span>
                    </h2>
                    <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                      Mỗi chủng nấm có chu kỳ sinh trưởng và định mức giá trị thương phẩm riêng
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {SPECIES_OPTIONS.map((spec) => {
                    const isSelected = selectedSpeciesId === spec.id;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => setSelectedSpeciesId(spec.id)}
                        className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#C28E58] bg-[#FAF5EE] dark:bg-[#322D28] shadow-md ring-2 ring-[#C28E58]/30'
                            : 'border-[#EAE1D3] dark:border-[#474039] bg-white dark:bg-[#1E1B18] hover:border-[#DECFC0] dark:hover:border-[#4A3222]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#523522]/10 dark:bg-[#C28E58]/20 text-[#523522] dark:text-[#E2BA78]">
                              {spec.badge}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-[#C28E58] text-white text-[11px] font-bold flex items-center justify-center">
                                ✓
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">
                            {spec.name}
                          </h3>
                          <p className="text-[11px] italic text-[#8A5C38] dark:text-[#A88B77]">
                            {spec.scientificName}
                          </p>
                          <p className="text-xs text-[#634936] dark:text-[#DAC7B5] mt-2 line-clamp-2">
                            {spec.benefits}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#EAE1D3]/80 dark:border-[#2B1C13] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#8C6D53] block">Chu kỳ:</span>
                            <span className="font-bold text-[#3B2212] dark:text-white">{spec.cycleDays} ngày/lứa</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#8C6D53] block">Định mức:</span>
                            <span className="font-bold text-[#C28E58]">~{spec.yieldPerTrayKg} kg/khay</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mục 2: Số Lượng Khay Nấm Thông Minh */}
              <div className="bg-white dark:bg-[#1E1B18] p-6 sm:p-8 rounded-3xl border border-[#DECFC0] dark:border-[#474039] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#523522] text-white flex items-center justify-center text-xs">2</span>
                      <span>Số Lượng Khay Nấm Thuê Trực Tuyến</span>
                    </h2>
                    <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                      Mỗi khay độc lập cảm biến IoT, camera macro và mã QR truy xuất VietGAP
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#C28E58]">{trayCount}</span>
                    <span className="text-xs font-bold text-[#8A5C38] ml-1">Khay</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={trayCount}
                    onChange={(e) => setTrayCount(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#EAE1D3] dark:bg-[#332014] rounded-lg appearance-none cursor-pointer accent-[#C28E58]"
                  />

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {[1, 3, 5, 10, 20].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setTrayCount(count)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          trayCount === count
                            ? 'bg-[#C28E58] text-white shadow-sm'
                            : 'bg-[#FAF5EE] dark:bg-[#322D28] text-[#6E4B33] dark:text-[#DAC7B5] hover:bg-[#F2E6D8]'
                        }`}
                      >
                        {count} khay {count >= 5 && '🔥'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mục 3: Thời Hạn Thuê & Ưu Đãi Chiết Khấu */}
              <div className="bg-white dark:bg-[#1E1B18] p-6 sm:p-8 rounded-3xl border border-[#DECFC0] dark:border-[#474039] shadow-sm space-y-4">
                <div>
                  <h2 className="text-lg font-black text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#523522] text-white flex items-center justify-center text-xs">3</span>
                    <span>Thời Hạn Gói Thuê &amp; Chiết Khấu FaaS</span>
                  </h2>
                  <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                    Gói thời hạn càng dài nhận mức chiết khấu phí thuê trực tiếp càng lớn
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {DURATION_OPTIONS.map((d) => {
                    const isSelected = durationMonths === d.months;
                    return (
                      <button
                        key={d.months}
                        type="button"
                        onClick={() => setDurationMonths(d.months)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-[#C28E58] bg-[#FAF5EE] dark:bg-[#322D28] ring-2 ring-[#C28E58]/30 shadow-sm'
                            : 'border-[#EAE1D3] dark:border-[#474039] bg-white dark:bg-[#1E1B18] hover:border-[#DECFC0]'
                        }`}
                      >
                        <span className="block font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">
                          {d.label}
                        </span>
                        <span className="text-[11px] font-semibold text-[#C28E58] block mt-0.5">
                          {d.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cột Phải (5 Cột): Bảng Dự Phóng Lợi Nhuận Realtime & Nút Đặt Khay */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
              <div className="rounded-3xl bg-gradient-to-b from-[#26170E] to-[#170E08] text-white p-6 sm:p-8 shadow-2xl border border-[#523522] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#523522]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#C28E58] font-bold block">
                      Dự Phóng Tài Chính
                    </span>
                    <h3 className="text-lg font-black text-[#FFF5EA]">
                      Hiệu Quả Đầu Tư FaaS
                    </h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                    ROI +{calculations.roiPercentage}%
                  </div>
                </div>

                {/* Các Dòng Chỉ Số Chi Tiết */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between text-[#DAC7B5]">
                    <span>Giống nấm đã chọn:</span>
                    <span className="font-bold text-white text-right max-w-[180px] truncate">
                      {selectedSpecies.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DAC7B5]">
                    <span>Quy mô nuôi trồng:</span>
                    <span className="font-bold text-white">
                      {trayCount} khay • {durationMonths} tháng
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DAC7B5]">
                    <span>Số lứa hái dự kiến:</span>
                    <span className="font-bold text-white">
                      {calculations.cycles} đợt thu hoạch
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DAC7B5] pt-2 border-t border-[#3D2517]">
                    <span>Sản lượng thu hoạch dự kiến:</span>
                    <span className="font-black text-amber-300 text-sm">
                      ~{calculations.totalYieldKg} kg nấm tươi
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DAC7B5]">
                    <span>Giá trị thị trường tương đương:</span>
                    <span className="font-bold text-white">
                      {formatVnd(calculations.totalMarketValue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#DAC7B5]">
                    <span>Tổng chi phí thuê trọn gói:</span>
                    <span className="font-bold text-[#E2BA78]">
                      {formatVnd(calculations.totalCost)}
                    </span>
                  </div>

                  {calculations.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                      <span>Ưu đãi thời hạn ({selectedDuration.tag}):</span>
                      <span>-{formatVnd(calculations.discountAmount)}</span>
                    </div>
                  )}

                  {/* Lợi Nhuận Ròng Nổi Bật */}
                  <div className="pt-3 border-t border-[#523522]">
                    <div className="p-3.5 rounded-2xl bg-[#3B2212] border border-[#C28E58]/50 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#DAC7B5] block">Lợi Nhuận Ròng / Tiết Kiệm:</span>
                        <span className="text-xl font-black text-emerald-400">
                          +{formatVnd(calculations.netProfit)}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                        Lãi ròng
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cam Kết Bảo Hiểm & Nút CTA */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBooking}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C28E58] to-[#9E6845] hover:from-[#D49E68] hover:to-[#B07855] text-[#170E08] font-black text-sm shadow-xl transition transform hover:-translate-y-0.5 text-center block"
                  >
                    Thuê {trayCount} Khay Ngay Nhận Ưu Đãi →
                  </button>

                  <p className="text-[11px] text-[#DAC7B5] text-center leading-relaxed">
                    ✓ Bảo hiểm 100% rủi ro sinh trưởng • Đổi trả khay hỏng miễn phí • Chứng nhận VietGAP tận nhà
                  </p>
                </div>
              </div>

              {/* Box Hỗ Trợ Kỹ Thuật */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#DECFC0] dark:border-[#474039] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#24170E] dark:text-[#FFF5EA]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Kỹ Sư Nông Nghiệp Trực Tuyến 24/7</span>
                </div>
                <p className="text-[#735843] dark:text-[#BFA895] leading-relaxed">
                  Cần tư vấn thiết kế khẩu phần nấm theo nhu cầu gia đình hoặc mở rộng quy mô thương phẩm? Hotline: <span className="font-bold text-[#C28E58]">1900 8899</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <CheckoutGatewayModal
          item={checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onTransactionSuccess={() => {
            setIsSuccessBooked(true);
          }}
        />
      </div>

      <Footer />
    </main>
  );
}
