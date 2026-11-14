'use client';

import React, { useState } from "react";
import Link from "next/link";
import { triggerSuccessConfetti } from "../../utils/confetti";
import { TiltCard } from "./TiltCard";
import { createRentalOrder, RentalResponse } from "../../services/api";

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
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [phone, setPhone] = useState("0900000011");
  const [address, setAddress] = useState("123 Đường Nấm Sạch, TP. Hồ Chí Minh");
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<RentalResponse["data"] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openBookingModal = (pkg: PackageItem) => {
    setSelectedPkg(pkg);
    setOrderResult(null);
    setErrorMessage(null);
  };

  const closeModal = () => {
    setSelectedPkg(null);
    setOrderResult(null);
    setErrorMessage(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await createRentalOrder({
        userId: 4, // customer1
        packageId: selectedPkg.packageId,
        deliveryAddress: address,
        receiverPhone: phone,
        paymentMethod: paymentMethod,
      });

      triggerSuccessConfetti();
      setOrderResult(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || "Không thể tạo đơn thuê khay. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
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
              onClick={() => openBookingModal(pkg)}
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

      {/* Booking Modal với kết nối API Backend Thực Tế */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-fade-in relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              ✕
            </button>

            {!orderResult ? (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Xác Nhận Hợp Đồng Thuê</span>
                  </div>
                  <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white">
                    {selectedPkg.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Giá trọn gói: <strong className="text-emerald-600 dark:text-emerald-400">{selectedPkg.price}</strong> • Thời hạn: {selectedPkg.duration}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="space-y-3 text-left text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                      Số điện thoại nhận nấm:
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                      Địa chỉ giao nấm thu hoạch:
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                      Phương thức thanh toán:
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="VNPAY">VNPAY Cổng thanh toán quốc gia</option>
                      <option value="VIETQR">Chuyển khoản VietQR tức thì</option>
                      <option value="COD">Thanh toán tiền mặt khi giao đợt 1</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 space-y-1">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500">🔒</span> CSDL T-SQL Locking & Concurrency:
                  </p>
                  <p>
                    Lệnh đặt sẽ thực thi <code>sp_CreateRentalOrder</code> với khóa <code>ROWLOCK, UPDLOCK, READPAST</code> để tự động gán khay vô trùng và chống xung đột giao dịch.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-[#0D5C3A] hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {loading ? "Đang xử lý khóa CSDL..." : "Xác Nhận Đặt Thuê"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <span className="text-4xl block">🎉</span>
                <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white">
                  Đặt Thuê Khay Nấm Thành Công!
                </h4>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800 pb-2">
                    <span className="text-slate-600 dark:text-slate-300">Mã đơn hàng CSDL:</span>
                    <strong className="text-emerald-800 dark:text-emerald-300 font-mono text-sm">{orderResult.orderCode}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800 pb-2">
                    <span className="text-slate-600 dark:text-slate-300">Mã khay nuôi được gán:</span>
                    <strong className="text-emerald-800 dark:text-emerald-300 font-mono text-sm">Khay #{orderResult.trayId}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">Trạng thái phát sóng:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Realtime socket `tray:occupied` đã gửi</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Khay nấm đã được kích hoạt vi khí hậu trên ma trận buồng nuôi. Bạn có thể sang trang Kỹ thuật viên để xem vị trí khay được cập nhật tức thì.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <Link
                    href="/operator"
                    className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition text-center"
                  >
                    Xem Ma Trận Điều Hành →
                  </Link>
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition text-center"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}