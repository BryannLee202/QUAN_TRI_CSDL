'use client';

import React, { useState } from "react";
import { MushroomSpeciesDetail } from "@/data/mushroomPackages";

interface MushroomDetailModalProps {
  mushroom: MushroomSpeciesDetail | null;
  onClose: () => void;
  onBookNow: (mushroom: MushroomSpeciesDetail) => void;
}

export default function MushroomDetailModal({
  mushroom,
  onClose,
  onBookNow,
}: MushroomDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"health" | "environment" | "faas">("health");

  if (!mushroom) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Nền đen mờ chống chói (Backdrop) */}
      <div
        className="fixed inset-0 bg-[#140D07]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Cửa sổ Modal chính */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1E1712] rounded-3xl shadow-2xl border border-[#EAE1D3] dark:border-[#3D2C20] overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-[#F2ECE3] dark:border-[#33251B] flex items-start justify-between gap-4 bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#251D16] dark:to-[#1E1712]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                mushroom.badgeTheme === "emerald"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  : mushroom.badgeTheme === "amber"
                  ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                  : mushroom.badgeTheme === "sky"
                  ? "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700"
                  : "bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700"
              }`}>
                {mushroom.badge}
              </span>
              <span className="text-xs font-semibold text-[#8C6D53] dark:text-[#BFA895]">
                {mushroom.categoryLabel}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#24170E] dark:text-white leading-tight">
              {mushroom.name}
            </h3>
            <p className="text-xs sm:text-sm font-serif italic text-[#7A5B43] dark:text-[#C5B09F]">
              {mushroom.scientificName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xl font-black text-[#8C4A26] dark:text-[#E2BA78]">
                {mushroom.price}
              </div>
              <div className="text-[11px] text-[#8C6D53] dark:text-[#BFA895] font-semibold">
                Chu kỳ {mushroom.duration}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#FAF5EE] dark:bg-[#2E2219] hover:bg-[#EAE0D2] dark:hover:bg-[#3D2C20] text-[#5C4332] dark:text-[#DAC7B5] transition cursor-pointer"
              title="Đóng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thân Modal (Cuộn nội dung) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-[#382618] dark:text-[#F0E6DC]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Cột trái (Ảnh nấm + Thông số nhanh) - 5 Cột */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-[#EAE1D3] dark:border-[#3D2C20] shadow-md bg-[#FAF7F2] dark:bg-[#251D16]">
                <img
                  src={mushroom.imageUrl}
                  alt={mushroom.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-[#24170E]/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                  {mushroom.certification}
                </div>
              </div>

              {/* Bảng thông số nhanh */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20] space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE1D3] dark:border-[#3D2C20]">
                  <span className="text-[#7A5B43] dark:text-[#BFA895]">Cam kết sản lượng:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{mushroom.expectedYield}</strong>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE1D3] dark:border-[#3D2C20]">
                  <span className="text-[#7A5B43] dark:text-[#BFA895]">Chu kỳ nuôi trồng:</span>
                  <strong className="font-bold">{mushroom.duration}</strong>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE1D3] dark:border-[#3D2C20]">
                  <span className="text-[#7A5B43] dark:text-[#BFA895]">Nguồn gốc giống:</span>
                  <span className="font-medium text-right truncate max-w-[180px]">{mushroom.origin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7A5B43] dark:text-[#BFA895]">Tiêu chuẩn áp dụng:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">VietGAP / ISO Class 5</span>
                </div>
              </div>
            </div>

            {/* Cột phải (Chi tiết sản phẩm E-Commerce) - 7 Cột */}
            <div className="md:col-span-7 space-y-4">
              <p className="text-sm leading-relaxed text-[#5C4332] dark:text-[#DAC7B5]">
                {mushroom.shortDesc}
              </p>

              {/* Thanh điều hướng Tab chi tiết */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF5EE] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20]">
                <button
                  type="button"
                  onClick={() => setActiveTab("health")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "health"
                      ? "bg-white dark:bg-[#33251B] text-[#8C4A26] dark:text-[#E2BA78] shadow-sm"
                      : "text-[#7A5B43] dark:text-[#BFA895] hover:text-[#24170E]"
                  }`}
                >
                  <span>🌿 Dược Tính & Sức Khỏe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("environment")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "environment"
                      ? "bg-white dark:bg-[#33251B] text-[#8C4A26] dark:text-[#E2BA78] shadow-sm"
                      : "text-[#7A5B43] dark:text-[#BFA895] hover:text-[#24170E]"
                  }`}
                >
                  <span>🔬 Vi Khí Hậu IoT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("faas")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "faas"
                      ? "bg-white dark:bg-[#33251B] text-[#8C4A26] dark:text-[#E2BA78] shadow-sm"
                      : "text-[#7A5B43] dark:text-[#BFA895] hover:text-[#24170E]"
                  }`}
                >
                  <span>🛡️ Cam Kết Dịch Vụ</span>
                </button>
              </div>

              {/* Tab 1: Dược tính & Ẩm thực */}
              {activeTab === "health" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20]">
                    <span className="text-[11px] uppercase font-bold text-[#8C6D53] dark:text-[#BFA895] block mb-1">
                      Hương vị đặc trưng:
                    </span>
                    <p className="text-xs font-semibold text-[#8C4A26] dark:text-[#E2BA78]">
                      {mushroom.flavorProfile}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A5B43] dark:text-[#BFA895] block">
                      Lợi ích sức khỏe kiểm nghiệm:
                    </span>
                    <ul className="grid grid-cols-1 gap-2 text-xs">
                      {mushroom.healthBenefits.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#F2ECE3] dark:border-[#33251B]">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A5B43] dark:text-[#BFA895] block">
                      Gợi ý chế biến & sử dụng:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mushroom.recommendedUses.map((use, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] font-medium"
                        >
                          🍴 {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Thông số môi trường Cleanroom */}
              {activeTab === "environment" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20]">
                      <span className="text-[11px] text-[#7A5B43] dark:text-[#BFA895] block">Nhiệt độ tối ưu</span>
                      <strong className="text-sm font-black text-[#8C4A26] dark:text-[#E2BA78]">
                        {mushroom.growingEnvironment.temp}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20]">
                      <span className="text-[11px] text-[#7A5B43] dark:text-[#BFA895] block">Độ ẩm không khí</span>
                      <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        {mushroom.growingEnvironment.humidity}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20]">
                      <span className="text-[11px] text-[#7A5B43] dark:text-[#BFA895] block">Nồng độ CO2 kiểm soát</span>
                      <strong className="text-sm font-black text-sky-700 dark:text-sky-400">
                        {mushroom.growingEnvironment.co2}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20]">
                      <span className="text-[11px] text-[#7A5B43] dark:text-[#BFA895] block">Ánh sáng quang phổ</span>
                      <strong className="text-xs font-bold text-[#5C4332] dark:text-[#F0E6DC] truncate block">
                        {mushroom.growingEnvironment.lightSpectrum}
                      </strong>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50 dark:bg-[#132238] border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2">
                    <span className="text-base shrink-0">📡</span>
                    <span>
                      Hệ thống cảm biến LoRaWAN truyền dữ liệu 5 giây/lần. Bộ điều khiển tự động kích hoạt quạt hút đối lưu và hệ thống phun sương nano siêu âm khi thông số lệch ngưỡng.
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 3: Quyền lợi FaaS */}
              {activeTab === "faas" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {mushroom.faasFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#251D16] border border-[#EAE1D3] dark:border-[#3D2C20] flex items-center gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#E2BA78]/20 text-[#8C4A26] dark:text-[#E2BA78] flex items-center justify-center font-bold text-xs shrink-0">
                          ★
                        </span>
                        <span className="font-semibold">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <span className="text-base shrink-0">🛡️</span>
                    <span>
                      <strong>Chính sách bảo hiểm FaaS 100%:</strong> Trong trường hợp bất khả kháng năng suất thu hoạch thực tế không đạt cam kết, khách hàng được bồi hoàn khay nuôi mới hoàn toàn miễn phí hoặc nhận hoàn tiền tương ứng.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal: Nút Thuê ngay */}
        <div className="p-4 sm:p-5 border-t border-[#F2ECE3] dark:border-[#33251B] bg-gradient-to-r from-[#FAF7F2] to-white dark:from-[#251D16] dark:to-[#1E1712] flex flex-wrap items-center justify-between gap-3">
          <div className="sm:hidden">
            <span className="text-base font-black text-[#8C4A26] dark:text-[#E2BA78]">
              {mushroom.price}
            </span>
            <span className="text-[11px] text-[#8C6D53] dark:text-[#BFA895] block">
              / Chu kỳ {mushroom.duration}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#474039] text-xs font-bold text-[#5C4332] dark:text-[#DAC7B5] hover:bg-[#FAF5EE] dark:hover:bg-[#2E2219] transition cursor-pointer"
            >
              Đóng lại
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookNow(mushroom);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#24170E] hover:bg-[#382417] dark:bg-[#C28E58] dark:hover:bg-[#D4A16A] text-white dark:text-[#1E1B18] text-xs font-black shadow-lg shadow-[#24170E]/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Thuê Khay Này Ngay ({mushroom.price})</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
