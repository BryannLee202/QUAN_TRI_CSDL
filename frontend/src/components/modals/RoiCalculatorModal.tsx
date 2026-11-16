'use client';

import React, { useState, useMemo } from 'react';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage?: (packageId: number) => void;
}

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
    name: 'Nấm Hầu Thủ (Lion\'s Mane)',
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

export default function RoiCalculatorModal({ isOpen, onClose }: RoiCalculatorModalProps) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('lions_mane');
  const [trayCount, setTrayCount] = useState<number>(3);
  const [durationMonths, setDurationMonths] = useState<number>(3);

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
    
    // Số chu kỳ thu hoạch trong khoảng thời gian (ngày = tháng * 30)
    const totalDays = durationMonths * 30;
    const cycles = Math.max(1, Math.floor(totalDays / selectedSpecies.cycleDays));
    
    // Tổng sản lượng ước tính
    const totalYieldKg = Number((selectedSpecies.yieldPerTrayKg * trayCount * cycles).toFixed(1));
    
    // Giá trị thương phẩm thị trường quy đổi
    const marketValue = Math.round(totalYieldKg * selectedSpecies.marketPricePerKg);
    
    // Lợi nhuận ròng / Số tiền tiết kiệm được
    const netProfit = marketValue - totalCost;
    
    // Tỷ suất ROI = (Giá trị quy đổi - Chi phí) / Chi phí * 100
    const roiPercentage = Math.round((netProfit / totalCost) * 100);

    return {
      totalCost,
      cycles,
      totalYieldKg,
      marketValue,
      netProfit,
      roiPercentage,
      savingsPerMonth: Math.round(netProfit / durationMonths),
    };
  }, [selectedSpecies, trayCount, durationMonths, selectedDuration]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#422C1D] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-[#EAE1D3] dark:border-[#38261A] flex items-center justify-between bg-gradient-to-r from-[#FAF5EE] via-[#F4ECE1] to-[#FAF5EE] dark:from-[#20140D] dark:to-[#170E08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#523522] text-[#FFF5EA] flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" />
                <line x1="8" x2="16" y1="6" y2="6" />
                <line x1="16" x2="16" y1="14" y2="14" />
                <path d="M16 10h.01" />
                <path d="M12 10h.01" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                  Máy Tính Lợi Nhuận & Ước Tính Sản Lượng Nấm FaaS
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#523522] text-[#FFF5EA]">
                  Smart Calculator
                </span>
              </div>
              <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-0.5">
                Mô phỏng tức thì sản lượng thu hoạch thực tế, chi phí thuê khay và tỷ suất sinh lời khi dùng hoặc bán lại
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

        {/* Nội dung 2 Cột */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cột Trái: Bảng điều khiển tham số (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Chọn giống nấm */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#523522] dark:text-[#DAC7B5] mb-2.5">
                1. Chọn Loại Giống Nấm Dược Liệu Nuôi Cấy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPECIES_OPTIONS.map((spec) => {
                  const isSelected = spec.id === selectedSpeciesId;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => setSelectedSpeciesId(spec.id)}
                      className={`text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#C28E58] bg-[#FAF5EE] dark:bg-[#2B1C13] shadow-sm ring-1 ring-[#C28E58]'
                          : 'border-[#E0D3C1] dark:border-[#38261A] hover:bg-[#FAF7F2] dark:hover:bg-[#22160E]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#24170E] dark:text-[#FFF5EA]">
                          {spec.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#C28E58] shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#8C6D53] dark:text-[#BFA895] italic mt-0.5">
                        {spec.scientificName}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-[#EAE1D3] dark:border-[#38261A]">
                        <span className="text-[#6E4B33] dark:text-[#DAC7B5]">Định mức:</span>
                        <strong className="text-[#24170E] dark:text-[#FFF5EA]">~{spec.yieldPerTrayKg} kg / khay</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Kéo chọn số lượng khay */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#22160E] border border-[#EAE1D3] dark:border-[#38261A] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#523522] dark:text-[#DAC7B5]">
                    2. Số Lượng Khay Nấm Thông Minh
                  </label>
                  <p className="text-[11px] text-[#8C6D53] dark:text-[#BFA895]">Mỗi khay độc lập cảm biến & mã QR VietGAP</p>
                </div>
                <div className="px-3.5 py-1 rounded-xl bg-[#523522] text-[#FFF5EA] font-mono font-bold text-sm shadow-xs">
                  {trayCount} Khay
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={20}
                value={trayCount}
                onChange={(e) => setTrayCount(Number(e.target.value))}
                className="w-full accent-[#C28E58] cursor-pointer"
              />

              <div className="flex items-center justify-between gap-1.5 pt-1">
                {[1, 3, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTrayCount(preset)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition ${
                      trayCount === preset
                        ? 'bg-[#C28E58] text-white border-[#C28E58]'
                        : 'bg-white dark:bg-[#1A1009] border-[#E0D3C1] dark:border-[#422C1D] text-[#735843] dark:text-[#DAC7B5]'
                    }`}
                  >
                    {preset} khay
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Chọn thời hạn thuê */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#523522] dark:text-[#DAC7B5] mb-2.5">
                3. Thời Hạn Gói Thuê & Ưu Đãi Chiết Khấu FaaS
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((dur) => (
                  <button
                    key={dur.months}
                    onClick={() => setDurationMonths(dur.months)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      durationMonths === dur.months
                        ? 'border-[#C28E58] bg-[#FAF5EE] dark:bg-[#2B1C13] shadow-xs'
                        : 'border-[#E0D3C1] dark:border-[#38261A] hover:bg-[#FAF7F2] dark:hover:bg-[#22160E]'
                    }`}
                  >
                    <span className="block text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">
                      {dur.label}
                    </span>
                    <span className="block text-[10px] text-[#A66C38] dark:text-[#E2BA78] mt-0.5 font-semibold">
                      {dur.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: Bảng Tóm Tắt Lợi Nhuận & ROI (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-b from-[#2B1C13] to-[#1C120C] text-[#FFF5EA] border border-[#543825] shadow-xl space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-[#422C1D] pb-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#DAC7B5]">
                  Dự Phóng Tài Chính FaaS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Chuẩn VietGAP
                </span>
              </div>

              {/* Con số ROI nổi bật */}
              <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-xs text-[#E2BA78] font-semibold">Tỷ Suất Hoàn Vốn / Tiết Kiệm (ROI)</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 tracking-tight">
                  +{calculations.roiPercentage}%
                </div>
                <p className="text-[11px] text-[#DAC7B5] mt-1">
                  Giá trị nông sản sạch thu về cao gấp ~{(calculations.marketValue / calculations.totalCost).toFixed(1)} lần chi phí thuê
                </p>
              </div>

              {/* Các chỉ số chi tiết */}
              <div className="space-y-3 mt-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[#DAC7B5]">Sản lượng thu hoạch dự kiến:</span>
                  <strong className="text-base text-amber-300 font-bold">
                    {calculations.totalYieldKg} kg nấm tươi
                  </strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[#DAC7B5]">Số lứa hái nấm (Cycles):</span>
                  <strong className="text-white font-semibold">
                    {calculations.cycles} đợt thu hoạch
                  </strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[#DAC7B5]">Chi phí thuê trọn gói:</span>
                  <strong className="text-white font-mono font-bold">
                    {calculations.totalCost.toLocaleString('vi-VN')} đ
                  </strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[#DAC7B5]">Giá trị thị trường tương đương:</span>
                  <strong className="text-emerald-400 font-mono font-bold">
                    {calculations.marketValue.toLocaleString('vi-VN')} đ
                  </strong>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#E2BA78] font-bold">Lợi nhuận ròng / Tiết kiệm:</span>
                  <strong className="text-emerald-300 font-mono font-black text-sm">
                    +{calculations.netProfit.toLocaleString('vi-VN')} đ
                  </strong>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-3 border-t border-[#422C1D]">
              <a
                href="/#packages"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C28E58] to-[#9E6845] hover:from-[#B37F49] hover:to-[#8C5734] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>Thuê {trayCount} Khay Ngay Nhận Ưu Đãi</span>
                <span>→</span>
              </a>
              <p className="text-[10px] text-center text-[#DAC7B5]/80">
                ✓ Được bảo hiểm 100% sản lượng • Đổi trả khay hỏng miễn phí
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
