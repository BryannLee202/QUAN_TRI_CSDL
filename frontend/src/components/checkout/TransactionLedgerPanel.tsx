'use client';

import React, { useEffect, useState, useCallback } from "react";
import { getPaymentHistoryApi, PaymentTransactionRecord } from "../../services/api";

interface TransactionLedgerPanelProps {
  refreshTrigger?: number;
  title?: string;
  subtitle?: string;
}

export default function TransactionLedgerPanel({
  refreshTrigger = 0,
  title = "Sổ Cái Chứng Từ Giao Dịch & Hợp Đồng Điện Tử",
  subtitle = "Danh sách hợp đồng thuê khay và đơn hàng nông sản đã được xác thực và lưu trữ trực tuyến",
}: TransactionLedgerPanelProps) {
  const [records, setRecords] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaymentHistoryApi(8);
      setRecords(data);
    } catch {
      // Giữ danh sách hiện tại nếu tạm thời mất kết nối
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshTrigger]);

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

  return (
    <div className="max-w-6xl mx-auto mt-12 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#DECFC0] dark:border-[#3D271A] shadow-lg overflow-hidden transition-all font-sans">
      {/* Header Sổ Cái */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#FAF5EE] via-white to-[#F4ECE1] dark:from-[#23160E] dark:via-[#1C120B] dark:to-[#23160E] border-b border-[#E3D5C3] dark:border-[#332014] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#24170E] dark:bg-[#2E1D12] border border-[#C28E58]/50 text-[#E2BA78] flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#24170E] dark:text-[#FAF5EE] tracking-tight">
                {title}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Trực tuyến ({records.length} chứng từ)</span>
              </span>
            </div>
            <p className="text-xs text-[#6E533E] dark:text-[#BFA895] mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#160F0A] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span>Làm mới danh sách</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((p) => !p)}
            className="px-3 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF6F0] dark:bg-[#24160E] text-xs font-bold text-[#523522] dark:text-[#DAC7B5] cursor-pointer"
          >
            {isExpanded ? "Thu gọn" : "Mở rộng"}
          </button>
        </div>
      </div>

      {/* Bảng Dữ Liệu Chứng Từ */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6F0] dark:bg-[#22160E] text-[#5C402B] dark:text-[#D8C4B0] border-b border-[#E3D5C3] dark:border-[#332014] font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Mã Tham Chiếu / Thời Gian</th>
                <th className="py-3.5 px-4">Số Hợp Đồng / Mã Khay Nuôi</th>
                <th className="py-3.5 px-4">Chủ Hợp Đồng &amp; Địa Chỉ Giao Nhận</th>
                <th className="py-3.5 px-4">Hạng Mục Đăng Ký</th>
                <th className="py-3.5 px-4">Phương Thức Thanh Toán</th>
                <th className="py-3.5 px-4 text-right">Giá Trị Quyết Toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E6D8] dark:divide-[#2A1B11]">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8C6D53]">
                    {loading ? "Đang tải danh sách chứng từ..." : "Chưa có bản ghi giao dịch nào."}
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => {
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
                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#24170E] dark:text-[#E2BA78]">
                            {rec.transactionRef}
                          </span>
                          {isNewest && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                              Mới
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C6D53] block mt-0.5">
                          {formatDateTime(rec.createdAt || rec.settledAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400 block">
                          {rec.orderCode}
                        </span>
                        {rec.trayCode ? (
                          <span className="text-[11px] font-semibold text-[#8C3A16] dark:text-amber-300 block mt-0.5">
                            Khay: {rec.trayCode}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8C6D53] block mt-0.5">
                            Đơn hàng thương phẩm
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-[230px]">
                        <div className="font-bold text-[#24170E] dark:text-white truncate tabular-nums">
                          {rec.customerName} • {rec.customerPhone}
                        </div>
                        <div className="text-[11px] text-[#6E533E] dark:text-[#BFA895] truncate mt-0.5" title={rec.deliveryAddress}>
                          {rec.deliveryAddress}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#24170E] dark:text-[#F5EBE0]">
                          {rec.itemName}
                        </div>
                        <div className="text-[11px] text-[#8C6D53] dark:text-[#BFA895] mt-0.5">
                          Thời hạn: {rec.durationLabel || "30 Ngày"} • Sản lượng: {rec.yieldCommitment || "Tiêu chuẩn"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-[#8C6D53] block mt-0.5 truncate max-w-[170px]">
                          {rec.bankOrCardInfo}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right tabular-nums">
                        <span className="font-extrabold text-sm text-[#24170E] dark:text-[#E2BA78] block">
                          {formatVnd(rec.netAmount)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <span>Đã quyết toán</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
