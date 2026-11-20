'use client';

import React, { useState } from "react";
import { TiltCard } from "./TiltCard";
import CheckoutGatewayModal, { CheckoutItemConfig } from "../checkout/CheckoutGatewayModal";
import TransactionLedgerPanel from "../checkout/TransactionLedgerPanel";

interface PackageItem {
  id: string;
  packageId: number;
  name: string;
  species: string;
  price: string;
  rawPrice: number;
  expectedYield: string;
  duration: string;
  isPopular?: boolean;
  features: string[];
}

const packages: PackageItem[] = [
  {
    id: "pkg-1",
    packageId: 1,
    name: "Gói Nấm Bào Ngư Xám",
    species: "Bào Ngư Xám Phòng Cleanroom",
    price: "299.000 VNĐ",
    rawPrice: 299000,
    expectedYield: "2.5 - 3.0 kg",
    duration: "30 Ngày",
    features: [
      "Định danh khay bằng mã QR riêng",
      "Giám sát nhiệt độ, độ ẩm 24/7",
      "Xem Timelapse nấm phát triển",
      "Miễn phí giao hàng tận nhà khi thu hoạch",
    ],
  },
  {
    id: "pkg-2",
    packageId: 2,
    name: "Gói Nấm Linh Chi Đỏ Luxury",
    species: "Linh Chi Đỏ Dược Liệu High-Tech",
    price: "899.000 VNĐ",
    rawPrice: 899000,
    expectedYield: "1.2 - 1.5 kg",
    duration: "90 Ngày",
    isPopular: true,
    features: [
      "Khay nấm đặt vị trí vi khí hậu tối ưu",
      "Cam kết sản lượng tiêu chuẩn dược liệu",
      "Quyền điều khiển quạt hút / phun sương từ xa",
      "Báo cáo tự động bằng AI hình ảnh",
    ],
  },
  {
    id: "pkg-3",
    packageId: 3,
    name: "Gói Đông Trùng Hạ Thảo",
    species: "Đông Trùng Hạ Thảo Chủng Cordyceps",
    price: "1.499.000 VNĐ",
    rawPrice: 1499000,
    expectedYield: "0.8 - 1.0 kg",
    duration: "60 Ngày",
    features: [
      "Môi trường vô trùng tuyệt đối ISO Class 5",
      "Camera Live Stream độ phân giải 4K riêng",
      "Hỗ trợ sấy thăng hoa đóng gói cao cấp",
      "Bảo hiểm 100% rủi ro nuôi trồng",
    ],
  },
];

export default function PackagesSection() {
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItemConfig | null>(null);
  const [ledgerRefresh, setLedgerRefresh] = useState<number>(0);

  const openBookingModal = (pkg: PackageItem) => {
    setCheckoutItem({
      orderType: "FAAS_RENTAL",
      packageId: pkg.packageId,
      itemName: pkg.name,
      subtitle: pkg.species,
      grossAmount: pkg.rawPrice,
      durationLabel: pkg.duration,
      yieldCommitment: pkg.expectedYield,
    });
  };

  return (
    <section id="packages" className="py-20 px-6 bg-[#FAF7F2]/80 dark:bg-[#140D07] text-[#24170E] dark:text-[#F7EFE6] transition-colors relative overflow-hidden">
      {/* Watermark Nấm Dược Liệu Nền Sân Khấu Bảng Giá */}
      <div className="absolute top-10 -left-12 w-96 h-96 text-[#C28E58] opacity-[0.035] dark:opacity-[0.05] pointer-events-none select-none -rotate-12">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 25 C50 25 20 60 20 90 C20 100 30 105 50 105 C60 105 65 110 68 120 C72 145 78 175 80 185 C83 190 117 190 120 185 C122 175 128 145 132 120 C135 110 140 105 150 105 C170 105 180 100 180 90 C180 60 150 25 100 25 Z" />
          <ellipse cx="70" cy="60" rx="12" ry="8" fill="white" fillOpacity="0.5" />
          <ellipse cx="130" cy="55" rx="10" ry="7" fill="white" fillOpacity="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-10 -right-12 w-96 h-96 text-emerald-800 opacity-[0.035] dark:opacity-[0.05] pointer-events-none select-none rotate-12">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M110 185 C105 150 100 120 95 90 C80 92 60 85 50 75 C30 55 45 30 75 25 C115 18 150 30 160 55 C165 68 155 82 135 88 C130 115 125 150 120 185 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto text-center space-y-3 mb-14 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#E0D3C1] dark:border-[#543825] text-xs font-bold text-[#6E4B33] dark:text-[#E2BA78]">
          <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
            <path d="M7 7h.01"/>
          </svg>
          <span>BẢNG GIÁ DỊCH VỤ FaaS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#24170E] dark:text-white">
          Danh Mục Các Gói Thuê Nấm
        </h2>
        <p className="text-[#634936] dark:text-[#DAC7B5] max-w-2xl mx-auto text-sm sm:text-base">
          Lựa chọn gói nuôi trồng phù hợp với nhu cầu chăm sóc sức khỏe hoặc làm quà tặng cao cấp. Cam kết sản lượng minh bạch có bảo hiểm.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {packages.map((pkg) => {
          const isPkg1 = pkg.id === 'pkg-1';
          const isPkg2 = pkg.id === 'pkg-2';
          const isPkg3 = pkg.id === 'pkg-3';

          return (
            <TiltCard
              key={pkg.id}
              className={`rounded-3xl p-7 sm:p-8 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
                isPkg2
                  ? "bg-gradient-to-b from-[#FFFDF9] via-white to-[#FDF5E8] dark:from-[#2E1D13] dark:via-[#24160E] dark:to-[#1C1109] border-2 border-[#C28E58] ring-4 ring-[#C28E58]/25 shadow-2xl shadow-[#C28E58]/30 md:-translate-y-4"
                  : isPkg1
                  ? "bg-gradient-to-b from-[#F2FBF6] via-white to-[#F2FBF6] dark:from-[#0E1D15] dark:via-[#14231B] dark:to-[#0E1D15] border-2 border-emerald-500/40 hover:border-emerald-500 shadow-md hover:shadow-xl hover:shadow-emerald-950/10"
                  : "bg-gradient-to-b from-[#F6F9FF] via-white to-[#F2F7FF] dark:from-[#0F172A] dark:via-[#131D31] dark:to-[#0F172A] border-2 border-sky-500/40 hover:border-sky-500 shadow-md hover:shadow-xl hover:shadow-sky-950/10"
              }`}
            >
              {/* Icon Nấm Ẩn Sâu Trong Lớp Nền Thẻ (Subtle Watermark Silhouette) */}
              {isPkg1 && (
                <div className="absolute -bottom-8 -right-8 w-44 h-44 text-emerald-700 opacity-[0.055] dark:opacity-[0.08] pointer-events-none select-none group-hover:scale-110 group-hover:opacity-[0.09] transition-all duration-500">
                  <svg viewBox="0 0 120 120" fill="currentColor">
                    <path d="M60 105 C58 90 56 75 55 60 C35 62 18 52 16 38 C14 22 36 15 62 14 C90 13 108 22 106 38 C104 52 86 62 66 60 C65 75 63 90 61 105 Z" />
                    <path d="M25 75 C18 68 15 58 20 48 C28 35 48 42 55 52 C58 58 56 68 48 74 Z" opacity="0.7" />
                    <path d="M95 78 C102 70 106 60 100 50 C92 38 72 44 65 54 C62 60 64 70 72 76 Z" opacity="0.7" />
                  </svg>
                </div>
              )}
              {isPkg2 && (
                <div className="absolute -bottom-8 -right-8 w-48 h-48 text-[#C28E58] opacity-[0.07] dark:opacity-[0.1] pointer-events-none select-none group-hover:scale-110 group-hover:opacity-[0.11] transition-all duration-500">
                  <svg viewBox="0 0 120 120" fill="currentColor">
                    <path d="M60 105 C57 85 55 68 53 50 C32 48 12 38 10 26 C8 12 34 8 60 8 C88 8 112 14 110 26 C108 38 88 48 67 50 C65 68 63 85 60 105 Z" />
                    <path d="M25 26 C35 32 50 35 60 35 C72 35 88 32 96 26" stroke="currentColor" strokeWidth="2" strokeOpacity="0.5" fill="none" />
                    <path d="M35 20 C42 24 52 26 60 26 C68 26 78 24 85 20" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                  </svg>
                </div>
              )}
              {isPkg3 && (
                <div className="absolute -bottom-8 -right-8 w-44 h-44 text-sky-700 opacity-[0.055] dark:opacity-[0.08] pointer-events-none select-none group-hover:scale-110 group-hover:opacity-[0.09] transition-all duration-500">
                  <svg viewBox="0 0 120 120" fill="currentColor">
                    <path d="M50 105 C48 80 44 55 48 35 C50 25 58 20 62 20 C66 20 72 26 72 38 C72 58 68 80 66 105 Z" />
                    <path d="M30 105 C30 85 26 65 32 50 C36 42 42 40 44 45 C46 50 44 68 42 85 C40 92 38 100 36 105 Z" opacity="0.7" />
                    <path d="M80 105 C78 88 84 70 80 55 C76 46 70 45 68 50 C66 56 70 72 72 88 C74 95 76 100 78 105 Z" opacity="0.7" />
                  </svg>
                </div>
              )}
              <div className="space-y-4">
                {/* Hàng Tiêu Đề Phụ & Huy Hiệu Độc Lập Chống Đè Chữ */}
                <div className="flex items-center justify-between gap-2 min-h-[28px]">
                  {isPkg2 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#8C3A16] via-[#B86E2A] to-[#6E2E10] text-white text-[11px] font-black uppercase tracking-wider shadow-sm border border-amber-300/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping"></span>
                      Ưa Chuộng Nhất • FaaS VIP
                    </span>
                  ) : isPkg1 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                      Nấm Ăn Tươi VietGAP
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-800 dark:text-sky-300 text-[11px] font-bold border border-sky-500/30">
                      Dược Liệu ISO Class 5
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-[#8C6D53] dark:text-[#BFA895] font-mono">
                    {pkg.duration}
                  </span>
                </div>

                {/* Tên Gói Nấm & Phân Loại Sinh Học */}
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-[#24170E] dark:text-white leading-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#735843] dark:text-[#DAC7B5] font-medium mt-1">
                    {pkg.species}
                  </p>
                </div>

                <div className="border-b border-[#EAE1D3] dark:border-[#38261A] pb-4">
                  <span className={`text-3xl font-black ${
                    isPkg2 
                      ? "text-[#523522] dark:text-[#F5CE76]" 
                      : isPkg1
                      ? "text-emerald-800 dark:text-emerald-300"
                      : "text-sky-900 dark:text-sky-300"
                  }`}>
                    {pkg.price}
                  </span>
                  <span className="text-[#8C6D53] dark:text-[#B59D89] text-xs font-semibold"> / {pkg.duration}</span>
                </div>

                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                  isPkg2
                    ? "bg-[#FAF5EE] dark:bg-[#331E12] text-[#4A3222] dark:text-[#E2BA78] border-[#DECFC0] dark:border-[#543825]"
                    : isPkg1
                    ? "bg-emerald-50/80 dark:bg-[#162A20] text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                    : "bg-sky-50/80 dark:bg-[#132238] text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800"
                }`}>
                  <span className="flex items-center gap-1.5">
                    <svg className={`w-3.5 h-3.5 ${isPkg1 ? 'text-emerald-600' : isPkg2 ? 'text-[#C28E58]' : 'text-sky-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                      <path d="M7 21h10"/>
                      <path d="M12 3v18"/>
                      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
                    </svg>
                    <span>Cam kết sản lượng:</span>
                  </span>
                  <span className="font-bold">{pkg.expectedYield}</span>
                </div>

                <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#5C4231] dark:text-[#DAC7B5]">
                  {pkg.features.map((ft, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className={`w-4 h-4 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                        isPkg2
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                          : isPkg1
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                          : "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700"
                      }`}>
                        ✓
                      </span>
                      <span>{ft}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => openBookingModal(pkg)}
                className={`mt-8 w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition transform active:scale-95 shadow-sm flex items-center justify-center gap-1.5 ${
                  isPkg2
                    ? "bg-gradient-to-r from-[#8C5A37] via-[#A86E45] to-[#C28E58] hover:from-[#754728] hover:to-[#A86E45] text-white shadow-xl shadow-[#C28E58]/30 border border-amber-300/40"
                    : isPkg1
                    ? "bg-[#24170E] hover:bg-[#382417] text-white border border-emerald-500/40 hover:border-emerald-400 shadow-md shadow-[#24170E]/20"
                    : "bg-[#24170E] hover:bg-[#382417] text-white border border-sky-500/40 hover:border-sky-400 shadow-md shadow-[#24170E]/20"
                }`}
              >
                <span>Đăng Ký Thuê Ngay</span>
                <span className={isPkg2 ? "text-[#FFF5EA] font-bold" : isPkg1 ? "text-emerald-400 font-bold" : "text-sky-400 font-bold"}>→</span>
              </button>
            </TiltCard>
          );
        })}
      </div>

      {/* Bảng Sổ Cái Giao Dịch & Hợp Đồng Điện Tử Lưu Trực Tiếp Trên MS SQL Server */}
      <div className="relative z-10">
        <TransactionLedgerPanel refreshTrigger={ledgerRefresh} />
      </div>

      {/* Cổng Thanh Toán Điện Tử MushroomPay Sandbox (3 Bước) */}
      <CheckoutGatewayModal
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onTransactionSuccess={() => setLedgerRefresh((prev) => prev + 1)}
      />
    </section>
  );
}