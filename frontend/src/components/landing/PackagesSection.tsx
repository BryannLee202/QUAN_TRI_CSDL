'use client';

import React, { useState, useMemo } from "react";
import { TiltCard } from "./TiltCard";
import CheckoutGatewayModal, { CheckoutItemConfig } from "../checkout/CheckoutGatewayModal";
import MushroomDetailModal from "./MushroomDetailModal";
import { MUSHROOM_PACKAGES, MushroomSpeciesDetail, MushroomCategory } from "@/data/mushroomPackages";

export default function PackagesSection() {
  const [selectedCategory, setSelectedCategory] = useState<MushroomCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMushroom, setSelectedMushroom] = useState<MushroomSpeciesDetail | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItemConfig | null>(null);

  const filteredMushrooms = useMemo(() => {
    return MUSHROOM_PACKAGES.filter((m) => {
      const matchCat = selectedCategory === "ALL" || m.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const openBookingModal = (mushroom: MushroomSpeciesDetail) => {
    setCheckoutItem({
      orderType: "FAAS_RENTAL",
      packageId: mushroom.packageId,
      itemName: `Gói Nuôi ${mushroom.name}`,
      subtitle: `${mushroom.scientificName} • Chu kỳ ${mushroom.duration}`,
      grossAmount: mushroom.rawPrice,
      durationLabel: mushroom.duration,
      yieldCommitment: mushroom.expectedYield,
    });
  };

  const categories: Array<{ key: MushroomCategory; label: string; icon: string; count: number }> = [
    { key: "ALL", label: "Tất Cả Loài Nấm", icon: "🍄", count: MUSHROOM_PACKAGES.length },
    { key: "CULINARY", label: "Nấm Ăn Dinh Dưỡng", icon: "🥗", count: MUSHROOM_PACKAGES.filter(m => m.category === "CULINARY").length },
    { key: "MEDICINAL", label: "Dược Liệu Quý", icon: "🧠", count: MUSHROOM_PACKAGES.filter(m => m.category === "MEDICINAL").length },
    { key: "PREMIUM", label: "Đặc Sản Cao Cấp", icon: "⭐", count: MUSHROOM_PACKAGES.filter(m => m.category === "PREMIUM").length },
  ];

  return (
    <section id="packages" className="py-20 px-4 sm:px-6 bg-[#FAF7F2]/80 dark:bg-[#140D07] text-[#24170E] dark:text-[#F7EFE6] transition-colors relative overflow-hidden">
      {/* Nền chìm Watermark nghệ thuật */}
      <div className="absolute top-10 -left-12 w-96 h-96 text-[#C28E58] opacity-[0.035] dark:opacity-[0.05] pointer-events-none select-none -rotate-12">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 25 C50 25 20 60 20 90 C20 100 30 105 50 105 C60 105 65 110 68 120 C72 145 78 175 80 185 C83 190 117 190 120 185 C122 175 128 145 132 120 C135 110 140 105 150 105 C170 105 180 100 180 90 C180 60 150 25 100 25 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto text-center space-y-3 mb-10 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5EE] dark:bg-[#322D28] border border-[#E0D3C1] dark:border-[#474039] text-xs font-bold text-[#6E4B33] dark:text-[#E2BA78]">
          <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
            <path d="M7 7h.01"/>
          </svg>
          <span>BẢNG GIÁ DỊCH VỤ FAAS &amp; DANH MỤC GIỐNG NẤM</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#24170E] dark:text-white">
          Danh Mục Các Gói Thuê Nấm Công Nghệ Cao
        </h2>
        <p className="text-[#634936] dark:text-[#DAC7B5] max-w-2xl mx-auto text-sm sm:text-base">
          Lựa chọn từ các loại nấm ăn dinh dưỡng tươi sạch tới thảo dược quý hiếm. Khách hàng có thể ấn vào từng loài nấm để đọc kỹ dược tính, môi trường IoT và đăng ký thuê khay như mua hàng.
        </p>

        {/* Thanh điều hướng phân loại danh mục (Category Tabs) & Tìm kiếm */}
        <div className="pt-5 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#24170E] text-[#E2BA78] border-[#C28E58] shadow-md dark:bg-[#C28E58] dark:text-[#1E1B18]"
                    : "bg-white dark:bg-[#251D16] text-[#5C4332] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#3D2C20] hover:border-[#C28E58]"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-[#1E1B18]/20 dark:text-[#1E1B18]"
                    : "bg-[#FAF5EE] dark:bg-[#33251B] text-[#7A5B43] dark:text-[#BFA895]"
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lưới sản phẩm nấm đa dạng (E-Commerce Product Grid) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {filteredMushrooms.map((mushroom) => {
          const isVip = mushroom.isPopular;

          return (
            <TiltCard
              key={mushroom.id}
              className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group bg-white dark:bg-[#1E1712] border ${
                isVip
                  ? "border-[#C28E58] ring-2 ring-[#C28E58]/30 shadow-xl shadow-[#C28E58]/20"
                  : "border-[#EAE1D3] dark:border-[#3D2C20] shadow-sm hover:shadow-xl hover:border-[#C28E58]"
              }`}
            >
              <div className="space-y-3.5">
                {/* Ảnh quả thể nấm chất lượng cao có thể bấm để xem chi tiết */}
                <div
                  onClick={() => setSelectedMushroom(mushroom)}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#FAF7F2] dark:bg-[#251D16] cursor-pointer"
                >
                  <img
                    src={mushroom.imageUrl}
                    alt={mushroom.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badge danh mục */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md border ${
                      mushroom.badgeTheme === "emerald"
                        ? "bg-emerald-600 text-white border-emerald-400"
                        : mushroom.badgeTheme === "amber"
                        ? "bg-amber-600 text-white border-amber-400"
                        : mushroom.badgeTheme === "sky"
                        ? "bg-sky-600 text-white border-sky-400"
                        : "bg-purple-600 text-white border-purple-400"
                    }`}>
                      {mushroom.badge}
                    </span>
                  </div>

                  {/* Nút xem nhanh mờ trên ảnh */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#1E1712]/90 backdrop-blur-md text-[#24170E] dark:text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#C28E58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Xem Chi Tiết</span>
                    </span>
                  </div>
                </div>

                {/* Tên thường gọi & Khoa học */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8C6D53] dark:text-[#BFA895] font-semibold">
                    <span>{mushroom.categoryLabel}</span>
                    <span className="font-mono">{mushroom.duration}</span>
                  </div>
                  <h3
                    onClick={() => setSelectedMushroom(mushroom)}
                    className="text-base sm:text-lg font-black text-[#24170E] dark:text-white leading-tight mt-1 hover:text-[#C28E58] transition cursor-pointer line-clamp-1"
                    title={mushroom.name}
                  >
                    {mushroom.name}
                  </h3>
                  <p className="text-[11px] font-serif italic text-[#7A5B43] dark:text-[#C5B09F] line-clamp-1">
                    {mushroom.scientificName}
                  </p>
                </div>

                {/* Khối Giá & Cam kết sản lượng */}
                <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20] space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#7A5B43] dark:text-[#BFA895]">Giá trọn gói:</span>
                    <span className="text-base sm:text-lg font-black text-[#8C4A26] dark:text-[#E2BA78]">
                      {mushroom.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#EAE1D3] dark:border-[#3D2C20]">
                    <span className="text-[#7A5B43] dark:text-[#BFA895]">Cam kết sản lượng:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{mushroom.expectedYield}</strong>
                  </div>
                </div>

                {/* Danh sách 2 tính năng nổi bật */}
                <ul className="space-y-1.5 text-xs text-[#5C4332] dark:text-[#DAC7B5]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                    <span className="line-clamp-1">{mushroom.healthBenefits[0]}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                    <span className="line-clamp-1">Môi trường: {mushroom.growingEnvironment.temp} • {mushroom.growingEnvironment.humidity}</span>
                  </li>
                </ul>
              </div>

              {/* Nhóm nút hành động: Xem chi tiết & Đăng ký thuê */}
              <div className="pt-4 grid grid-cols-2 gap-2 mt-2 border-t border-[#F2ECE3] dark:border-[#33251B]">
                <button
                  type="button"
                  onClick={() => setSelectedMushroom(mushroom)}
                  className="w-full py-2.5 px-2 rounded-xl text-xs font-bold border border-[#DECFC0] dark:border-[#474039] text-[#5C4332] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#2E2219] hover:border-[#C28E58] transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 text-[#C28E58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Chi Tiết</span>
                </button>

                <button
                  type="button"
                  onClick={() => openBookingModal(mushroom)}
                  className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 cursor-pointer ${
                    isVip
                      ? "bg-[#C28E58] hover:bg-[#D4A16A] text-[#1E1B18] font-black shadow-md shadow-[#C28E58]/30"
                      : "bg-[#24170E] hover:bg-[#382417] text-white dark:bg-[#33251B] dark:hover:bg-[#473426]"
                  }`}
                >
                  <span>Thuê Ngay</span>
                  <span>→</span>
                </button>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Cửa Sổ Xem Chi Tiết Giống Nấm (Quick View Modal) */}
      <MushroomDetailModal
        mushroom={selectedMushroom}
        onClose={() => setSelectedMushroom(null)}
        onBookNow={(m) => openBookingModal(m)}
      />

      {/* Cổng Thanh Toán Điện Tử MushroomPay Sandbox (3 Bước) */}
      <CheckoutGatewayModal
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
      />
    </section>
  );
}
