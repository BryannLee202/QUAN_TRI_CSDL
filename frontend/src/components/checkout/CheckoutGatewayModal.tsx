'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import {
  initiatePaymentSessionApi,
  confirmPaymentCheckoutApi,
  PaymentSessionData,
  PaymentTransactionRecord,
} from "../../services/api";
import { triggerSuccessConfetti } from "../../utils/confetti";

export interface CheckoutItemConfig {
  orderType: "FAAS_RENTAL" | "MARKET_BATCH";
  packageId?: number;
  batchCode?: string;
  itemName: string;
  subtitle?: string;
  grossAmount: number;
  durationLabel: string;
  yieldCommitment: string;
}

interface CheckoutGatewayModalProps {
  item: CheckoutItemConfig | null;
  onClose: () => void;
  onTransactionSuccess?: (record: PaymentTransactionRecord) => void;
}

type PaymentMethodKey = "VIETQR_NAPAS" | "VNPAY_GATEWAY" | "INTERNATIONAL_CARD" | "COD_ESCROW";

interface PaymentChannelMeta {
  key: PaymentMethodKey;
  title: string;
  subtitle: string;
  badge: string;
  bankLabel: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeStyle: string;
}

const PAYMENT_CHANNELS: PaymentChannelMeta[] = [
  {
    key: "VIETQR_NAPAS",
    title: "Chuyển Khoản Liên Ngân Hàng VietQR Napas 247",
    subtitle: "Quét mã QR tiêu chuẩn ngân hàng, tự động điền chính xác số tiền và nội dung thanh toán",
    badge: "Khuyên dùng",
    bankLabel: "Chuyển khoản VietQR Napas 247",
    accentBorder: "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20",
    accentBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
    accentText: "text-emerald-900 dark:text-emerald-300",
    badgeStyle: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  },
  {
    key: "VNPAY_GATEWAY",
    title: "Cổng Thanh Toán VNPAY-QR & Ví Điện Tử",
    subtitle: "Thanh toán nhanh qua ứng dụng VNPAY, MoMo, ZaloPay và hơn 40 ngân hàng nội địa",
    badge: "Cổng Quốc Gia",
    bankLabel: "Cổng thanh toán VNPAY-QR",
    accentBorder: "border-sky-600 dark:border-sky-500 ring-2 ring-sky-500/20",
    accentBg: "bg-sky-50/70 dark:bg-sky-950/30",
    accentText: "text-sky-900 dark:text-sky-300",
    badgeStyle: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-700",
  },
  {
    key: "INTERNATIONAL_CARD",
    title: "Thẻ Thanh Toán Quốc Tế (Visa / Mastercard / JCB)",
    subtitle: "Xác thực bảo mật 3D-Secure 2.0 tiêu chuẩn quốc tế",
    badge: "Thẻ Quốc Tế",
    bankLabel: "Thẻ Quốc Tế Visa •••• 4242",
    accentBorder: "border-[#C28E58] ring-2 ring-[#C28E58]/25",
    accentBg: "bg-[#FAF5EE] dark:bg-[#281A11]",
    accentText: "text-[#523522] dark:text-[#E2BA78]",
    badgeStyle: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  },
  {
    key: "COD_ESCROW",
    title: "Thanh Toán Khi Nghiệm Thu Thương Phẩm (COD)",
    subtitle: "Xác lập hợp đồng trước, thanh toán trực tiếp khi nhận bàn giao đợt thu hoạch đầu tiên",
    badge: "Đảm Bảo Sản Lượng",
    bankLabel: "Ủy thác thanh toán khi nhận hàng",
    accentBorder: "border-amber-700 dark:border-amber-600 ring-2 ring-amber-600/20",
    accentBg: "bg-amber-50/60 dark:bg-amber-950/25",
    accentText: "text-amber-900 dark:text-amber-300",
    badgeStyle: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300 border-stone-300 dark:border-stone-700",
  },
];

const VOUCHER_PRESETS = [
  { code: "FAASVIP50", title: "FAASVIP50", desc: "Giảm 50.000 VNĐ" },
  { code: "NEWFARMER10", title: "NEWFARMER10", desc: "Ưu đãi 10%" },
  { code: "VIETGAP30", title: "VIETGAP30", desc: "Giảm 30.000 VNĐ" },
];

export default function CheckoutGatewayModal({
  item,
  onClose,
  onTransactionSuccess,
}: CheckoutGatewayModalProps) {
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState(user?.fullName || "Lê Minh Tài");
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || "0908222005");
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address || "Khu Công Nghệ Cao, Phường Tân Phú, TP. Thủ Đức, TP. Hồ Chí Minh"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("VIETQR_NAPAS");
  const [voucherCode, setVoucherCode] = useState<string>("FAASVIP50");

  const [sessionData, setSessionData] = useState<PaymentSessionData | null>(null);
  const [countdown, setCountdown] = useState<number>(900);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardHolder, setCardHolder] = useState("LE MINH TAI");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardOtp, setCardOtp] = useState("123456");

  const [isInitiating, setIsInitiating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptRecord, setReceiptRecord] = useState<PaymentTransactionRecord | null>(null);

  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
      if (user.address) setDeliveryAddress(user.address);
    }
  }, [user]);

  useEffect(() => {
    if (item) {
      setStep(1);
      setSessionData(null);
      setReceiptRecord(null);
      setErrorMessage(null);
      setCountdown(900);
    }
  }, [item]);

  useEffect(() => {
    if (step !== 2) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  if (!item) return null;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(Math.max(0, Math.round(amount))) + " VNĐ";
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const previewDiscount = (() => {
    const code = voucherCode.trim().toUpperCase();
    if (code === "FAASVIP50") return Math.min(50000, Math.max(0, item.grossAmount - 10000));
    if (code === "VIETGAP30") return Math.min(30000, Math.max(0, item.grossAmount - 10000));
    if (code === "NEWFARMER10") return Math.min(150000, Math.round(item.grossAmount * 0.1));
    return 0;
  })();

  const previewNetAmount = Math.max(0, item.grossAmount - previewDiscount);
  const currentChannel = PAYMENT_CHANNELS.find((c) => c.key === paymentMethod) || PAYMENT_CHANNELS[0];

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleProceedToGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInitiating(true);
    setErrorMessage(null);

    try {
      const res = await initiatePaymentSessionApi({
        orderType: item.orderType,
        packageId: item.packageId,
        itemName: item.itemName,
        grossAmount: item.grossAmount,
        voucherCode: voucherCode.trim() || undefined,
        paymentMethod,
        customerName: customerName.trim(),
      });
      setSessionData(res.data);
      setCountdown(res.data.expiresInSeconds || 900);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "Không thể khởi tạo phiên giao dịch. Vui lòng kiểm tra kết nối.");
    } finally {
      setIsInitiating(false);
    }
  };

  const handleConfirmSandboxPayment = async () => {
    setIsConfirming(true);
    setErrorMessage(null);

    try {
      setProcessingStage("Đang xác thực giao dịch với cổng thanh toán...");
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStage(
        item.orderType === "FAAS_RENTAL"
          ? "Đang khởi tạo hợp đồng điện tử và cấp phát khay nuôi vô trùng..."
          : "Đang xác nhận đơn hàng và phát hành chứng từ thanh toán..."
      );
      await new Promise((r) => setTimeout(r, 450));

      const bankInfoLabel =
        paymentMethod === "INTERNATIONAL_CARD"
          ? `Thẻ Quốc Tế Visa •••• ${cardNumber.slice(-4)}`
          : currentChannel.bankLabel;

      const res = await confirmPaymentCheckoutApi({
        transactionRef: sessionData?.transactionRef,
        orderType: item.orderType,
        packageId: item.packageId,
        userId: user?.id || 4,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        itemName: item.itemName,
        durationLabel: item.durationLabel,
        yieldCommitment: item.yieldCommitment,
        grossAmount: item.grossAmount,
        voucherCode: voucherCode.trim() || undefined,
        paymentMethod,
        bankOrCardInfo: bankInfoLabel,
        batchCode: item.batchCode,
      });

      setReceiptRecord(res.data);
      setStep(3);
      triggerSuccessConfetti();

      if (onTransactionSuccess) {
        onTransactionSuccess(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi xử lý giao dịch. Vui lòng thử lại.");
    } finally {
      setIsConfirming(false);
      setProcessingStage("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Cổng thanh toán điện tử MushroomCloud"
    >
      <div className="my-auto w-full max-w-4xl rounded-3xl bg-[#FDFBF8] dark:bg-[#160F0A] border border-[#D9C8B4] dark:border-[#3D271A] shadow-2xl overflow-hidden text-[#24170E] dark:text-[#F5EBE0]">
        {/* Thanh Header Trang Trọng & Đồng Bộ Nhận Diện Thương Hiệu */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E130B] via-[#2B1B10] to-[#1A1009] text-white border-b border-[#C28E58]/35 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Biểu tượng Thương hiệu MushroomCloud Đồng Bộ Navbar */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-[#EADACA] dark:from-[#2C1D14] dark:to-[#1F140E] border border-[#D5C3B0] dark:border-[#4A3222] flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="checkout-brand-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8C5A3C" />
                    <stop offset="0.5" stopColor="#633D26" />
                    <stop offset="1" stopColor="#3B2213" />
                  </linearGradient>
                  <linearGradient id="checkout-gold-grad" x1="20" y1="20" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C28E58" />
                    <stop offset="1" stopColor="#E2B888" />
                  </linearGradient>
                </defs>
                <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#checkout-brand-grad)" />
                <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="url(#checkout-gold-grad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#checkout-brand-grad)" />
                <circle cx="34" cy="20" r="3" fill="url(#checkout-gold-grad)" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-[#FAF5EE]">
                  Cổng Thanh Toán &amp; Xác Lập Hợp Đồng Điện Tử
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Bảo Mật Tiêu Chuẩn
                </span>
              </div>
              <p className="text-xs text-[#D8C4B0] mt-0.5">
                Hệ thống Nông nghiệp Công nghệ cao MushroomCloud • Chế độ mô phỏng thanh toán (Không trừ tiền thật)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-[#DAC7B5] hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer shrink-0"
            title="Đóng cửa sổ"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Thanh Tiến Trình 3 Bước Đồng Bộ Phông Chữ */}
        <div className="px-6 py-3.5 bg-[#F4ECE1] dark:bg-[#1E130C] border-b border-[#E3D5C3] dark:border-[#332014] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#24170E] dark:text-[#E2BA78] font-bold" : "text-[#8C6D53] font-medium"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                step === 1
                  ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08]"
                  : "bg-emerald-700 text-white"
              }`}>
                {step > 1 ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "1"
                )}
              </span>
              <span>01. Kê Khai &amp; Chọn Kênh</span>
            </div>

            <span className="text-[#C5B09B] dark:text-[#4A3222]">/</span>

            <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#24170E] dark:text-[#E2BA78] font-bold" : "text-[#8C6D53] font-medium"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                step === 2
                  ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08]"
                  : step > 2
                  ? "bg-emerald-700 text-white"
                  : "bg-[#DECFC0] dark:bg-[#332014] text-[#6E4B33]"
              }`}>
                {step > 2 ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  "2"
                )}
              </span>
              <span>02. Ủy Quyền Thanh Toán</span>
            </div>

            <span className="text-[#C5B09B] dark:text-[#4A3222]">/</span>

            <div className={`flex items-center gap-2 ${step === 3 ? "text-emerald-800 dark:text-emerald-400 font-bold" : "text-[#8C6D53] font-medium"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                step === 3
                  ? "bg-emerald-700 text-white"
                  : "bg-[#DECFC0] dark:bg-[#332014] text-[#6E4B33]"
              }`}>
                3
              </span>
              <span>03. Chứng Từ &amp; Hợp Đồng Điện Tử</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#6E4B33] dark:text-[#C28E58]">
            <svg className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Kết nối bảo mật SSL 256-Bit</span>
          </div>
        </div>

        {/* Nội Dung Chính Theo Từng Bước */}
        <div className="p-6 sm:p-7 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-semibold flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================
              BƯỚC 1: KÊ KHAI THÔNG TIN & CHỌN PHƯƠNG THỨC THANH TOÁN
          ============================================================ */}
          {step === 1 && (
            <form onSubmit={handleProceedToGateway} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cột Trái (7 cột) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Thông Tin Chủ Hợp Đồng &amp; Nhận Bàn Giao</span>
                    </h4>
                    <span className="text-[11px] font-medium text-[#8C6D53]">Thông tin bắt buộc (*)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-[#3B2516] dark:text-[#DAC7B5] mb-1.5">
                        Họ và tên khách hàng (*)
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] text-[#24170E] dark:text-white focus:outline-none focus:border-[#C28E58] font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#3B2516] dark:text-[#DAC7B5] mb-1.5">
                        Số điện thoại liên hệ (*)
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] text-[#24170E] dark:text-white focus:outline-none focus:border-[#C28E58] font-medium tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold text-[#3B2516] dark:text-[#DAC7B5] mb-1.5">
                      Địa chỉ tiếp nhận thương phẩm thu hoạch (*)
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] text-[#24170E] dark:text-white focus:outline-none focus:border-[#C28E58] font-medium"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-3.5 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] flex items-center gap-2 border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-3">
                    <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>Phương Thức Thanh Toán</span>
                  </h4>

                  <div className="space-y-2.5">
                    {PAYMENT_CHANNELS.map((ch) => {
                      const isSelected = paymentMethod === ch.key;
                      return (
                        <button
                          key={ch.key}
                          type="button"
                          onClick={() => setPaymentMethod(ch.key)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                            isSelected
                              ? `${ch.accentBorder} ${ch.accentBg}`
                              : "border-[#E3D5C3] dark:border-[#332014] bg-[#FDFBF8] dark:bg-[#18100A] hover:border-[#C28E58]"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            ch.key === "VIETQR_NAPAS"
                              ? "bg-emerald-700 text-white border-emerald-500"
                              : ch.key === "VNPAY_GATEWAY"
                              ? "bg-sky-800 text-white border-sky-500"
                              : ch.key === "INTERNATIONAL_CARD"
                              ? "bg-slate-900 text-[#E2BA78] border-[#C28E58]"
                              : "bg-amber-800 text-white border-amber-600"
                          }`}>
                            {ch.key === "VIETQR_NAPAS" && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14v2" />
                              </svg>
                            )}
                            {ch.key === "VNPAY_GATEWAY" && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                              </svg>
                            )}
                            {ch.key === "INTERNATIONAL_CARD" && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                                <line x1="6" y1="15" x2="10" y2="15" />
                              </svg>
                            )}
                            {ch.key === "COD_ESCROW" && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                <path d="m3.3 7 8.7 5 8.7-5" />
                                <path d="M12 22V12" />
                              </svg>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={`text-xs sm:text-sm font-bold ${isSelected ? ch.accentText : "text-[#24170E] dark:text-[#F5EBE0]"}`}>
                                {ch.title}
                              </span>
                              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${ch.badgeStyle}`}>
                                {ch.badge}
                              </span>
                            </div>
                            <p className="text-xs text-[#6E533E] dark:text-[#BFA895] mt-1 leading-relaxed">
                              {ch.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cột Phải (5 cột): Bản Kê Chi Phí */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-4 shadow-2xs">
                  <div className="border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D53] dark:text-[#C28E58] block">
                      {item.orderType === "FAAS_RENTAL" ? "Thông Tin Gói Thuê Khay" : "Thông Tin Đơn Hàng Nông Sản"}
                    </span>
                    <h4 className="text-base font-bold text-[#24170E] dark:text-white mt-1">
                      {item.itemName}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">{item.subtitle}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                      <span className="text-[11px] text-[#8C6D53] block">Thời hạn hợp đồng:</span>
                      <strong className="text-xs font-bold text-[#24170E] dark:text-[#E2BA78] mt-0.5 block">{item.durationLabel}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                      <span className="text-[11px] text-[#8C6D53] block">Sản lượng cam kết:</span>
                      <strong className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-0.5 block">{item.yieldCommitment}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-[#3B2516] dark:text-[#DAC7B5]">
                      Mã Ưu Đãi Thương Mại:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã ưu đãi"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] text-xs font-bold uppercase text-[#24170E] dark:text-[#E2BA78] focus:outline-none focus:border-[#C28E58]"
                      />
                      {voucherCode && (
                        <button
                          type="button"
                          onClick={() => setVoucherCode("")}
                          className="px-3 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-semibold text-[#8C6D53] hover:text-[#24170E] dark:hover:text-white"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {VOUCHER_PRESETS.map((v) => {
                        const active = voucherCode.trim().toUpperCase() === v.code;
                        return (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => setVoucherCode(v.code)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                              active
                                ? "bg-emerald-800 text-white border-emerald-600"
                                : "bg-[#FAF6F0] dark:bg-[#25170E] text-[#523522] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#3D2619] hover:border-[#C28E58]"
                            }`}
                          >
                            {v.title} • {v.desc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F0E6D8] dark:border-[#2C1D13] space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#634936] dark:text-[#BFA895]">
                      <span>Giá trị hợp đồng niêm yết:</span>
                      <span className="font-semibold text-[#24170E] dark:text-white tabular-nums">{formatVnd(item.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 dark:text-emerald-400">
                      <span>Khấu trừ ưu đãi thương mại:</span>
                      <span className="font-bold tabular-nums">-{formatVnd(previewDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-[#634936] dark:text-[#BFA895]">
                      <span>Bảo hiểm sản lượng &amp; Vận chuyển:</span>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-400">Miễn phí</span>
                    </div>
                    <div className="pt-3 border-t border-[#E3D5C3] dark:border-[#38261A] flex items-baseline justify-between">
                      <span className="font-bold text-sm text-[#24170E] dark:text-white">Tổng Thanh Toán:</span>
                      <span className="font-extrabold text-xl text-[#8C3A16] dark:text-[#E2BA78] tabular-nums">
                        {formatVnd(previewNetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF5EE] dark:bg-[#24160E] border border-[#E3D5C3] dark:border-[#3D271A] text-xs text-[#634936] dark:text-[#BFA895] space-y-1">
                    <div className="font-bold text-[#3B2516] dark:text-[#E2BA78] flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#C28E58] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span>Chính Sách Bảo Đảm Hợp Đồng Điện Tử:</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      Hợp đồng được định danh theo mã khay nuôi độc lập tại trang trại và cam kết bồi hoàn 100% sản lượng theo tiêu chuẩn VietGAP.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-bold text-[#6E4B33] dark:text-[#DAC7B5] hover:bg-[#F4ECE1] dark:hover:bg-[#261810] transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isInitiating}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#24170E] via-[#3B2415] to-[#523522] hover:from-[#382417] hover:to-[#6B442C] text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 border border-[#C28E58]/50 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isInitiating ? "Đang khởi tạo giao dịch..." : "Tiếp Tục Thanh Toán"}</span>
                    <svg className="w-4 h-4 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ============================================================
              BƯỚC 2: MÀN HÌNH CỔNG THANH TOÁN TƯƠNG TÁC
          ============================================================ */}
          {step === 2 && sessionData && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F4ECE1] via-[#FAF6F0] to-[#F4ECE1] dark:from-[#22160E] dark:via-[#1C120B] dark:to-[#22160E] border border-[#DECFC0] dark:border-[#3D271A] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#24170E] dark:text-white">
                        Mã Tham Chiếu Giao Dịch:
                      </span>
                      <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#2C1C12] border border-[#D9C8B5] dark:border-[#4A3222] text-[#8C3A16] dark:text-[#E2BA78] tabular-nums">
                        {sessionData.transactionRef}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E533E] dark:text-[#BFA895] mt-0.5">
                      Phiên thanh toán đang hoạt động. Vui lòng hoàn tất xác nhận để kích hoạt hợp đồng.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#160F0A] border border-[#DECFC0] dark:border-[#38261A]">
                  <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8C6D53] block leading-none">Thời gian còn lại:</span>
                    <strong className="text-sm font-bold text-[#24170E] dark:text-[#E2BA78] tabular-nums">
                      {formatTime(countdown)}
                    </strong>
                  </div>
                </div>
              </div>

              {(paymentMethod === "VIETQR_NAPAS" || paymentMethod === "VNPAY_GATEWAY") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#1E140D] border-2 border-emerald-600/40 dark:border-emerald-500/40 flex flex-col items-center justify-between text-center shadow-sm">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-[#F0E6D8] dark:border-[#2C1D13]">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        {paymentMethod === "VIETQR_NAPAS" ? "VIETQR • NAPAS 247" : "CỔNG VNPAY-QR"}
                      </span>
                      <span className="text-xs font-semibold text-[#8C6D53] tabular-nums">
                        Mã NH: {sessionData.bankInfo.bankBin}
                      </span>
                    </div>

                    <div className="my-4 p-3 rounded-2xl bg-white border border-[#E3D5C3] shadow-inner">
                      <img
                        src={sessionData.qrImageUrl}
                        alt="Mã QR Chuyển khoản Ngân hàng VietQR"
                        className="w-52 h-52 object-contain mx-auto"
                      />
                    </div>

                    <p className="text-xs text-[#634936] dark:text-[#BFA895] leading-relaxed">
                      Mã QR tích hợp sẵn số tiền <strong className="font-bold text-[#24170E] dark:text-white tabular-nums">{formatVnd(sessionData.netAmount)}</strong> và nội dung <strong className="font-bold text-[#24170E] dark:text-white">{sessionData.bankInfo.transferMemo}</strong>.
                    </p>
                  </div>

                  <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2.5">
                        Thông Tin Tài Khoản Thụ Hưởng Doanh Nghiệp
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] text-[#8C6D53] block">Ngân hàng thụ hưởng:</span>
                            <strong className="text-[#24170E] dark:text-white font-bold">{sessionData.bankInfo.bankName}</strong>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                            Napas 247
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A]">
                          <span className="text-[11px] text-[#8C6D53] block">Đơn vị thụ hưởng:</span>
                          <strong className="text-[#24170E] dark:text-white font-bold">{sessionData.bankInfo.accountName}</strong>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-[#8C6D53] block">Số tài khoản:</span>
                              <strong className="text-sm font-bold text-[#24170E] dark:text-[#E2BA78] tabular-nums">{sessionData.bankInfo.accountNo}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy("0382482793", "ACCOUNT")}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1009] border border-[#D9C8B5] dark:border-[#4A3222] text-[11px] font-semibold text-[#523522] dark:text-[#E2BA78] hover:border-[#C28E58] cursor-pointer"
                            >
                              {copiedField === "ACCOUNT" ? "Đã chép" : "Sao chép"}
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between">
                            <div>
                              <span className="text-[11px] text-[#8C6D53] block">Nội dung thanh toán:</span>
                              <strong className="text-sm font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">{sessionData.bankInfo.transferMemo}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(sessionData.bankInfo.transferMemo, "MEMO")}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1009] border border-[#D9C8B5] dark:border-[#4A3222] text-[11px] font-semibold text-[#523522] dark:text-[#E2BA78] hover:border-[#C28E58] cursor-pointer"
                            >
                              {copiedField === "MEMO" ? "Đã chép" : "Sao chép"}
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">Tổng Số Tiền Thanh Toán:</span>
                          <strong className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 tabular-nums">
                            {formatVnd(sessionData.netAmount)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#C28E58] text-xs space-y-1.5">
                        <div className="flex items-center gap-2.5 font-bold text-[#24170E] dark:text-[#E2BA78]">
                          <span className="w-4 h-4 rounded-full border-2 border-[#C28E58] border-t-transparent animate-spin shrink-0"></span>
                          <span>{processingStage}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-4 py-3.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-bold text-[#6E4B33] dark:text-[#DAC7B5] hover:bg-[#F4ECE1] dark:hover:bg-[#261810] transition cursor-pointer"
                        >
                          ← Quay Lại
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmSandboxPayment}
                          className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          <span>Xác Nhận Hoàn Tất Thanh Toán</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "INTERNATIONAL_CARD" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#1E293B] to-[#0F172A] text-white border border-[#C28E58]/50 shadow-xl space-y-6 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-[#C28E58] via-[#E8C89B] to-[#A67442] border border-amber-200/50 flex items-center justify-center">
                          <div className="w-7 h-5 border border-[#523522]/40 rounded-xs grid grid-cols-2"></div>
                        </div>
                        <span className="text-xs font-bold tracking-wider text-[#E2BA78] uppercase">
                          VISA INFINITE
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                          Số Thẻ Thanh Toán Quốc Tế
                        </span>
                        <div className="text-lg sm:text-xl font-bold tracking-widest text-[#FAF5EE] tabular-nums">
                          {cardNumber || "4242 •••• •••• 4242"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 block">Chủ Thẻ</span>
                          <strong className="tracking-wider text-white uppercase font-bold">{cardHolder || "LE MINH TAI"}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-slate-400 block">Hiệu Lực</span>
                          <strong className="text-[#E2BA78] font-bold tabular-nums">{cardExpiry || "12/28"}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber("4242 •••• •••• 4242");
                        setCardHolder("LE MINH TAI");
                        setCardExpiry("12/28");
                        setCardCvv("888");
                        setCardOtp("123456");
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#C28E58] text-xs font-bold text-[#523522] dark:text-[#E2BA78] hover:bg-[#F0E6D8] transition cursor-pointer"
                    >
                      Điền Thông Tin Thẻ Mẫu (4242 •••• 4242)
                    </button>
                  </div>

                  <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5 text-xs">
                      <h4 className="font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2.5">
                        Thông Tin Ủy Quyền Thẻ Quốc Tế (3D-Secure 2.0)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-1">Số thẻ</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-bold tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Tên in trên thẻ</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-bold uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold mb-1">Hết hạn (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-bold tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Mã bảo mật CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={4}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-bold tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Mã xác thực OTP</label>
                          <input
                            type="text"
                            value={cardOtp}
                            onChange={(e) => setCardOtp(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 font-bold text-emerald-800 dark:text-emerald-300 tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#DECFC0] dark:border-[#3D271A] flex items-center justify-between">
                        <span className="font-bold">Tổng số tiền thanh toán:</span>
                        <strong className="text-lg font-extrabold text-[#8C3A16] dark:text-[#E2BA78] tabular-nums">
                          {formatVnd(sessionData.netAmount)}
                        </strong>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#C28E58] text-xs font-bold flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full border-2 border-[#C28E58] border-t-transparent animate-spin shrink-0"></span>
                        <span>{processingStage}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-4 py-3.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-bold text-[#6E4B33] dark:text-[#DAC7B5] cursor-pointer"
                        >
                          ← Quay Lại
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmSandboxPayment}
                          className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#3B2415] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-lg transition border border-[#C28E58] cursor-pointer"
                        >
                          Xác Nhận Thanh Toán Thẻ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "COD_ESCROW" && (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Xác Nhận Hợp Đồng Thanh Toán Khi Nhận Bàn Giao (COD)
                    </h4>
                    <p className="text-xs text-[#634936] dark:text-[#BFA895] leading-relaxed">
                      Hệ thống sẽ cấp phát ngay khay nấm vô trùng và kích hoạt quy trình nuôi trồng. Khoản phí <strong className="font-bold text-[#24170E] dark:text-white tabular-nums">{formatVnd(sessionData.netAmount)}</strong> sẽ được thanh toán trực tiếp khi nhân viên bàn giao đợt nấm thu hoạch đầu tiên tại địa chỉ: <strong className="text-[#24170E] dark:text-white">{deliveryAddress}</strong>.
                    </p>
                  </div>

                  {isConfirming ? (
                    <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#C28E58] text-xs font-bold flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full border-2 border-[#C28E58] border-t-transparent animate-spin shrink-0"></span>
                      <span>{processingStage}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-3.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-bold text-[#6E4B33] dark:text-[#DAC7B5] cursor-pointer"
                      >
                        ← Quay Lại
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSandboxPayment}
                        className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-800 to-[#523522] text-white font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer"
                      >
                        Xác Lập Hợp Đồng &amp; Cấp Phát Khay Ngay
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              BƯỚC 3: CHỨNG TỪ GIAO DỊCH & HỢP ĐỒNG ĐIỆN TỬ TRANG TRỌNG
          ============================================================ */}
          {step === 3 && receiptRecord && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C120B] border-2 border-[#C28E58] shadow-xl relative overflow-hidden space-y-6">
                {/* Tiêu đề Chứng từ & Dấu xác nhận đồng bộ font chữ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-dashed border-[#DECFC0] dark:border-[#3D271A]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center shadow-sm border border-emerald-500/40 shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                        Chứng Từ Giao Dịch &amp; Hợp Đồng Nuôi Trồng FaaS
                      </span>
                      <h4 className="text-lg sm:text-xl font-extrabold text-[#24170E] dark:text-white tracking-tight mt-0.5">
                        Hợp Đồng Điện Tử &amp; Biên Lai Thu Tiền
                      </h4>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl border border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider self-start sm:self-center flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Đã Quyết Toán • Paid</span>
                  </div>
                </div>

                {/* Bảng thông tin 2 cột đồng bộ phông chữ Plus Jakarta Sans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#24170F] border border-[#EAE0D3] dark:border-[#38261A] space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A5B43] dark:text-[#C28E58] border-b border-[#EAE0D3] dark:border-[#38261A] pb-2">
                      I. Thông Tin Định Danh Chứng Từ
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Mã tham chiếu giao dịch:</span>
                      <strong className="font-bold text-[#24170E] dark:text-[#E2BA78] tabular-nums">{receiptRecord.transactionRef}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Số hợp đồng điện tử:</span>
                      <strong className="font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">{receiptRecord.orderCode}</strong>
                    </div>
                    {receiptRecord.trayCode && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#6E533E] dark:text-[#BFA895]">Mã định danh khay nuôi:</span>
                        <strong className="font-bold text-[#8C3A16] dark:text-amber-300 tabular-nums">
                          {receiptRecord.trayCode} (Khay số {receiptRecord.trayId})
                        </strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Phương thức thanh toán:</span>
                      <strong className="font-bold text-[#24170E] dark:text-white text-right">{receiptRecord.bankOrCardInfo || receiptRecord.paymentMethod}</strong>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#24170F] border border-[#EAE0D3] dark:border-[#38261A] space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A5B43] dark:text-[#C28E58] border-b border-[#EAE0D3] dark:border-[#38261A] pb-2">
                      II. Chủ Sở Hữu &amp; Giá Trị Quyết Toán
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Chủ thể hợp đồng:</span>
                      <strong className="font-bold text-[#24170E] dark:text-white tabular-nums">{receiptRecord.customerName} ({receiptRecord.customerPhone})</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Hạng mục đăng ký:</span>
                      <strong className="font-bold text-[#24170E] dark:text-white text-right">{receiptRecord.itemName}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Khấu trừ ưu đãi thương mại:</span>
                      <strong className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        -{formatVnd(receiptRecord.discountAmount)} {receiptRecord.voucherCode ? `(${receiptRecord.voucherCode})` : ""}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAE0D3] dark:border-[#38261A]">
                      <span className="font-bold text-[#24170E] dark:text-white">Tổng Giá Trị Quyết Toán:</span>
                      <strong className="text-base font-extrabold text-[#8C3A16] dark:text-[#E2BA78] tabular-nums">
                        {formatVnd(receiptRecord.netAmount)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cụm nút hành động sau thanh toán */}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-3 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#1E140D] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] hover:border-[#C28E58] transition flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  <span>In Chứng Từ / Xuất PDF</span>
                </button>

                <Link
                  href="/operator"
                  className="px-5 py-3 rounded-xl bg-[#24170E] hover:bg-[#382417] text-white text-xs font-bold border border-[#C28E58]/40 transition flex items-center gap-2"
                >
                  <span>Xem Khay Trên Ma Trận Điều Hành</span>
                  <svg className="w-4 h-4 text-[#E2BA78]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <Link
                  href="/ho-so"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <span>Xem Trong Hồ Sơ &amp; Lịch Sử Giao Dịch</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
