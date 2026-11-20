'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getPaymentHistoryApi, PaymentTransactionRecord } from "@/services/api";

export default function UserProfileAndHistoryPage() {
  const { user, isAuthenticated } = useAuth();

  const [records, setRecords] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<"ALL" | "FAAS_RENTAL" | "MARKET_BATCH">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransactionRecord | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaymentHistoryApi(30);
      setRecords(data);
    } catch {
      // Giữ danh sách hiện tại nếu tạm thời gián đoạn
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(amount))) + " VNĐ";
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return "Vừa ghi nhận";
    try {
      const d = new Date(iso);
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Vừa ghi nhận";
    }
  };

  const getMethodBadge = (method: string) => {
    const m = (method || "").toUpperCase();
    if (m.includes("VIETQR")) {
      return {
        label: "VietQR Napas 247",
        cls: "bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
      };
    }
    if (m.includes("VNPAY")) {
      return {
        label: "Cổng VNPAY-QR",
        cls: "bg-sky-100/90 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-700",
      };
    }
    if (m.includes("CARD") || m.includes("VISA")) {
      return {
        label: "Thẻ Quốc Tế 3DS",
        cls: "bg-slate-900 text-[#E2BA78] dark:bg-slate-800 dark:text-amber-300 border-[#C28E58]",
      };
    }
    return {
      label: "Ủy Thác COD",
      cls: "bg-amber-100/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    };
  };

  // Thống kê tổng hợp tài khoản
  const stats = useMemo(() => {
    const totalOrders = records.length;
    const rentalCount = records.filter((r) => r.orderType === "FAAS_RENTAL").length;
    const marketCount = records.filter((r) => r.orderType === "MARKET_BATCH").length;
    const activeTrays = new Set(records.filter((r) => r.trayCode).map((r) => r.trayCode)).size;
    const totalSpent = records.reduce((sum, r) => sum + (Number(r.netAmount) || 0), 0);
    return { totalOrders, rentalCount, marketCount, activeTrays, totalSpent };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchType = filterType === "ALL" || r.orderType === filterType;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchType;
      const matchSearch =
        (r.transactionRef || "").toLowerCase().includes(q) ||
        (r.orderCode || "").toLowerCase().includes(q) ||
        (r.trayCode || "").toLowerCase().includes(q) ||
        (r.itemName || "").toLowerCase().includes(q) ||
        (r.customerName || "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [records, filterType, searchQuery]);

  const displayUser = {
    fullName: user?.fullName || "Lê Minh Tài",
    email: user?.email || "customer1@mushroomcloud.test",
    phone: user?.phoneNumber || "0908 222 005",
    address: user?.address || "Khu Công Nghệ Cao, Phường Tân Phú, TP. Thủ Đức, TP. Hồ Chí Minh",
    role: user?.role || "Customer",
  };

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] transition-colors flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        {/* Header Trang Hồ Sơ & Lịch Sử Giao Dịch */}
        <div className="bg-gradient-to-b from-[#F5EEE4] via-[#FBF7F0] to-[#FDFBF8] dark:from-[#20140D] dark:via-[#19100A] dark:to-[#140D08] border-b border-[#EAE1D3] dark:border-[#38261A] py-10 px-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A5C38] dark:text-[#C28E58]">
              <Link href="/" className="hover:underline flex items-center gap-1">
                <span>← Trang Chủ</span>
              </Link>
              <span>/</span>
              <span className="text-[#3B2212] dark:text-[#FFF5EA]">Tài Khoản Thành Viên</span>
              <span>/</span>
              <span className="text-[#C28E58] font-bold">Hồ Sơ &amp; Lịch Sử Giao Dịch</span>
            </div>

            {/* Khối Định Danh Hồ Sơ Cá Nhân */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#38261A] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3B2213] via-[#6B442C] to-[#C28E58] text-white flex items-center justify-center font-extrabold text-2xl shadow-md border border-[#E2BA78]/40 shrink-0">
                  {displayUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#24170E] dark:text-white tracking-tight">
                      {displayUser.fullName}
                    </h1>
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      {isAuthenticated ? "Thành Viên Đã Xác Thực" : "Tài Khoản Thành Viên FaaS"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#6E533E] dark:text-[#BFA895]">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>{displayUser.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{displayUser.phone}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{displayUser.address}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/#packages"
                  className="px-4 py-2.5 rounded-xl bg-[#24170E] hover:bg-[#382417] text-white text-xs font-bold border border-[#C28E58]/40 transition shadow-xs"
                >
                  Đăng Ký Thuê Khay Mới
                </Link>
                <Link
                  href="/san-nong-san"
                  className="px-4 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#422C1D] bg-[#FAF5EE] dark:bg-[#22160E] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition"
                >
                  Sàn Nông Sản FaaS
                </Link>
              </div>
            </div>

            {/* 3 Thẻ Chỉ Số Thống Kê Hồ Sơ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-[#735843] dark:text-[#BFA895] block">Tổng Hợp Đồng &amp; Đơn Hàng</span>
                  <strong className="text-2xl font-extrabold text-[#24170E] dark:text-white tabular-nums">
                    {stats.totalOrders} chứng từ
                  </strong>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#8C3A16] dark:text-[#E2BA78] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-[#735843] dark:text-[#BFA895] block">Khay Nấm Đang Sở Hữu</span>
                  <strong className="text-2xl font-extrabold text-[#24170E] dark:text-white tabular-nums">
                    {stats.activeTrays} khay định danh
                  </strong>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-2xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-[#735843] dark:text-[#BFA895] block">Tổng Giá Trị Đã Quyết Toán</span>
                  <strong className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums">
                    {formatVnd(stats.totalSpent)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Khu Vực Bảng Lịch Sử Mua Hàng, Hợp Đồng Thuê Khay & Chứng Từ Thanh Toán */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="rounded-3xl bg-white dark:bg-[#1A110B] border border-[#DECFC0] dark:border-[#3D271A] shadow-md overflow-hidden">
            {/* Thanh Công Cụ & Bộ Lọc */}
            <div className="p-6 bg-gradient-to-r from-[#FAF5EE] via-white to-[#F4ECE1] dark:from-[#23160E] dark:via-[#1C120B] dark:to-[#23160E] border-b border-[#E3D5C3] dark:border-[#332014] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#24170E] dark:text-white tracking-tight">
                    Lịch Sử Mua Hàng &amp; Hợp Đồng Điện Tử
                  </h2>
                  <p className="text-xs text-[#6E533E] dark:text-[#BFA895] mt-0.5">
                    Quản lý toàn bộ các hợp đồng thuê khay nấm FaaS, đơn hàng nông sản và chứng từ thanh toán của bạn
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative min-w-[230px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm số hợp đồng, mã khay, gói nấm..."
                      className="w-full px-3.5 py-2 pl-9 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#160F0A] text-xs text-[#24170E] dark:text-white placeholder:text-[#8C6D53] focus:outline-none focus:border-[#C28E58]"
                    />
                    <svg className="w-3.5 h-3.5 text-[#8C6D53] absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>

                  <button
                    type="button"
                    onClick={loadTransactions}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#160F0A] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* Các Tab Lọc Theo Danh Mục */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === "ALL"
                      ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08] shadow-xs"
                      : "bg-white dark:bg-[#160F0A] text-[#6E4B33] dark:text-[#DAC7B5] border border-[#E3D5C3] dark:border-[#332014] hover:border-[#C28E58]"
                  }`}
                >
                  Tất Cả Giao Dịch ({stats.totalOrders})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("FAAS_RENTAL")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === "FAAS_RENTAL"
                      ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08] shadow-xs"
                      : "bg-white dark:bg-[#160F0A] text-[#6E4B33] dark:text-[#DAC7B5] border border-[#E3D5C3] dark:border-[#332014] hover:border-[#C28E58]"
                  }`}
                >
                  Hợp Đồng Thuê Khay FaaS ({stats.rentalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("MARKET_BATCH")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === "MARKET_BATCH"
                      ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08] shadow-xs"
                      : "bg-white dark:bg-[#160F0A] text-[#6E4B33] dark:text-[#DAC7B5] border border-[#E3D5C3] dark:border-[#332014] hover:border-[#C28E58]"
                  }`}
                >
                  Đơn Mua Nông Sản ({stats.marketCount})
                </button>
              </div>
            </div>

            {/* Bảng Chi Tiết */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF6F0] dark:bg-[#22160E] text-[#5C402B] dark:text-[#D8C4B0] border-b border-[#E3D5C3] dark:border-[#332014] font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Mã Tham Chiếu / Thời Gian</th>
                    <th className="py-3.5 px-4">Số Hợp Đồng / Mã Khay Nuôi</th>
                    <th className="py-3.5 px-4">Hạng Mục Đăng Ký</th>
                    <th className="py-3.5 px-4">Thông Tin Nhận Bàn Giao</th>
                    <th className="py-3.5 px-4">Phương Thức Thanh Toán</th>
                    <th className="py-3.5 px-4 text-right">Giá Trị Quyết Toán</th>
                    <th className="py-3.5 px-4 text-center">Chứng Từ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6D8] dark:divide-[#2A1B11]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8C6D53]">
                        {loading ? "Đang tải lịch sử giao dịch..." : "Không tìm thấy giao dịch nào phù hợp."}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec, index) => {
                      const badge = getMethodBadge(rec.paymentMethod);
                      const isNewest = index === 0;
                      return (
                        <tr
                          key={rec.transactionId || rec.transactionRef}
                          className={`transition-colors ${
                            isNewest
                              ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/70"
                              : "hover:bg-[#FAF7F2] dark:hover:bg-[#21150D]"
                          }`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap tabular-nums">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#24170E] dark:text-[#E2BA78]">
                                {rec.transactionRef}
                              </span>
                              {isNewest && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                                  Mới nhất
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8C6D53] block mt-0.5">
                              {formatDateTime(rec.createdAt || rec.settledAt)}
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap tabular-nums">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400 block">
                              {rec.orderCode}
                            </span>
                            {rec.trayCode ? (
                              <span className="text-[11px] font-semibold text-[#8C3A16] dark:text-amber-300 block mt-0.5">
                                Khay: {rec.trayCode}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#8C6D53] block mt-0.5">
                                Thương phẩm nông sản
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-bold text-[#24170E] dark:text-[#F5EBE0]">
                              {rec.itemName}
                            </div>
                            <div className="text-[11px] text-[#8C6D53] dark:text-[#BFA895] mt-0.5">
                              Chu kỳ: {rec.durationLabel || "30 Ngày"} • Sản lượng: {rec.yieldCommitment || "Tiêu chuẩn"}
                            </div>
                          </td>

                          <td className="py-4 px-4 max-w-[220px]">
                            <div className="font-bold text-[#24170E] dark:text-white truncate tabular-nums">
                              {rec.customerName} • {rec.customerPhone}
                            </div>
                            <div className="text-[11px] text-[#6E533E] dark:text-[#BFA895] truncate mt-0.5" title={rec.deliveryAddress}>
                              {rec.deliveryAddress}
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>
                              {badge.label}
                            </span>
                            <span className="text-[11px] text-[#8C6D53] block mt-0.5 truncate max-w-[160px]">
                              {rec.bankOrCardInfo}
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-right tabular-nums">
                            <span className="font-extrabold text-sm text-[#24170E] dark:text-[#E2BA78] block">
                              {formatVnd(rec.netAmount)}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              Đã quyết toán
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(rec)}
                              className="px-3 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF6F0] dark:bg-[#24160E] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition cursor-pointer"
                            >
                              Xem Chứng Từ
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hộp Thoại Xem & In Lại Chứng Từ Hợp Đồng Điện Tử */}
        {selectedReceipt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1C120B] border-2 border-[#C28E58] shadow-2xl p-6 sm:p-8 space-y-6 text-[#24170E] dark:text-[#F5EBE0]">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-dashed border-[#DECFC0] dark:border-[#3D271A]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center shadow-sm shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      Chứng Từ Hợp Đồng Điện Tử MushroomCloud
                    </span>
                    <h3 className="text-lg font-extrabold text-[#24170E] dark:text-white">
                      Biên Lai Quyết Toán Dịch Vụ
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="w-8 h-8 rounded-xl bg-[#FAF5EE] dark:bg-[#261810] text-[#735843] hover:text-[#24170E] dark:hover:text-white flex items-center justify-center border border-[#DECFC0] dark:border-[#3D271A] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#24170F] border border-[#EAE0D3] dark:border-[#38261A] space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A5B43] dark:text-[#C28E58] border-b border-[#EAE0D3] dark:border-[#38261A] pb-1.5">
                    I. Thông Tin Định Danh
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#6E533E] dark:text-[#BFA895]">Mã tham chiếu:</span>
                    <strong className="font-bold tabular-nums">{selectedReceipt.transactionRef}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#6E533E] dark:text-[#BFA895]">Số hợp đồng:</span>
                    <strong className="font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">{selectedReceipt.orderCode}</strong>
                  </div>
                  {selectedReceipt.trayCode && (
                    <div className="flex justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Mã định danh khay:</span>
                      <strong className="font-bold text-[#8C3A16] dark:text-amber-300 tabular-nums">{selectedReceipt.trayCode}</strong>
                    </div>
                  )}
                  <div className="flex justify-between gap-2">
                    <span className="text-[#6E533E] dark:text-[#BFA895]">Thời gian lập:</span>
                    <strong className="font-semibold tabular-nums">{formatDateTime(selectedReceipt.createdAt || selectedReceipt.settledAt)}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#24170F] border border-[#EAE0D3] dark:border-[#38261A] space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A5B43] dark:text-[#C28E58] border-b border-[#EAE0D3] dark:border-[#38261A] pb-1.5">
                    II. Chi Tiết Quyết Toán
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#6E533E] dark:text-[#BFA895]">Khách hàng:</span>
                    <strong className="font-bold">{selectedReceipt.customerName}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#6E533E] dark:text-[#BFA895]">Hạng mục:</span>
                    <strong className="font-bold text-right">{selectedReceipt.itemName}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#6E533E] dark:text-[#BFA895]">Kênh thanh toán:</span>
                    <strong className="font-semibold text-right">{selectedReceipt.bankOrCardInfo || selectedReceipt.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between gap-2 pt-1.5 border-t border-[#EAE0D3] dark:border-[#38261A]">
                    <span className="font-bold">Tổng thanh toán:</span>
                    <strong className="text-sm font-extrabold text-[#8C3A16] dark:text-[#E2BA78] tabular-nums">
                      {formatVnd(selectedReceipt.netAmount)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] hover:border-[#C28E58] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  <span>In Chứng Từ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#24170E] text-white text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
