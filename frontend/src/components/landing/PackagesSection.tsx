'use client';

import React, { useState } from "react";
import { triggerSuccessConfetti } from "../../utils/confetti";
import { TiltCard } from "./TiltCard";

const packages = [
  {
    id: "pkg-1",
    name: "Gói Nấm Bào Ngư Xám",
    species: "Bào Ngư Xám Phòng Cleanroom",
    price: "299.000 VNĐ",
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
    name: "Gói Nấm Linh Chi Đỏ Luxury",
    species: "Linh Chi Đỏ Dược Liệu High-Tech",
    price: "899.000 VNĐ",
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
    name: "Gói Đông Trùng Hạ Thảo",
    species: "Đông Trùng Hạ Thảo Chủng Cordyceps",
    price: "1.499.000 VNĐ",
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
  const [bookedPackage, setBookedPackage] = useState<string | null>(null);

  const handleBooking = (pkgName: string) => {
    triggerSuccessConfetti();
    setBookedPackage(pkgName);
  };

  return (
    <section id="packages" className="py-20 px-6 bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto text-center space-y-3 mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <span>📦 BẢNG GIÁ DỊCH VỤ FaaS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Danh Mục Các Gói Thuê Nấm
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Lựa chọn gói nuôi trồng phù hợp với nhu cầu chăm sóc sức khỏe hoặc làm quà tặng cao cấp. Cam kết sản lượng minh bạch có bảo hiểm.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {packages.map((pkg) => (
          <TiltCard
            key={pkg.id}
            className={`bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border transition-all duration-300 flex flex-col justify-between relative ${
              pkg.isPopular
                ? "border-2 border-emerald-500 ring-4 ring-emerald-500/10 md:-translate-y-2 shadow-xl"
                : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase shadow-md tracking-wider">
                Ưa Chuộng Nhất
              </span>
            )}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {pkg.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {pkg.species}
                </p>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {pkg.price}
                </span>
                <span className="text-slate-400 text-xs font-semibold"> / {pkg.duration}</span>
              </div>

              <div className="bg-emerald-50/70 dark:bg-slate-800/80 p-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>⚖️ Cam kết sản lượng:</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">{pkg.expectedYield}</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {pkg.features.map((ft, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleBooking(pkg.name)}
              className={`mt-8 w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition transform active:scale-95 shadow-sm ${
                pkg.isPopular
                  ? "bg-gradient-to-r from-emerald-600 to-[#0D5C3A] hover:from-emerald-500 hover:to-emerald-700 text-white shadow-emerald-700/20"
                  : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white"
              }`}
            >
              Đăng Ký Thuê Ngay
            </button>
          </TiltCard>
        ))}
      </div>

      {bookedPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-emerald-200 dark:border-emerald-700 text-center animate-fade-in">
            <span className="text-4xl block">🎉</span>
            <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white">
              Đăng Ký Thuê Thành Công!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn đã chọn <strong>{bookedPackage}</strong>. Hệ thống CSDL đang thực thi thủ tục <code>sp_CreateRentalOrder</code> với khóa dòng bi quan để gán mã khay QR riêng biệt cho bạn.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setBookedPackage(null)}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition"
              >
                Vào Cổng Khách Hàng Theo Dõi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
