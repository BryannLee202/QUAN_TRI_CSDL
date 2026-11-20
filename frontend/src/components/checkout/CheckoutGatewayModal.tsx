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
    title: "Chuyển Khoản VietQR Napas 247",
    subtitle: "Quét mã QR liên ngân hàng tự động điền số tiền và nội dung bút toán",
    badge: "Khuyên dùng • Tức thì",
    bankLabel: "VietQR Napas 247 • MBBank 970422",
    accentBorder: "border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20",
    accentBg: "bg-emerald-50/70 dark:bg-emerald-950/30",
    accentText: "text-emerald-800 dark:text-emerald-300",
    badgeStyle: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  },
  {
    key: "VNPAY_GATEWAY",
    title: "Cổng Thanh Toán VNPAY-QR & Ví Điện Tử",
    subtitle: "Hỗ trợ VNPAY-QR, MoMo, ZaloPay và hơn 40 ứng dụng Mobile Banking",
    badge: "Cổng Quốc Gia",
    bankLabel: "Cổng VNPAY-QR • Định danh doanh nghiệp",
    accentBorder: "border-sky-600 dark:border-sky-500 ring-2 ring-sky-500/20",
    accentBg: "bg-sky-50/70 dark:bg-sky-950/30",
    accentText: "text-sky-900 dark:text-sky-300",
    badgeStyle: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-700",
  },
  {
    key: "INTERNATIONAL_CARD",
    title: "Thẻ Thanh Toán Quốc Tế (Visa / Mastercard / JCB)",
    subtitle: "Ủy quyền thẻ tự động qua chuẩn bảo mật 3D-Secure 2.0 (Thẻ mẫu Sandbox)",
    badge: "3D-Secure SSL",
    bankLabel: "Thẻ Quốc Tế VISA •••• 4242 (Sandbox)",
    accentBorder: "border-[#C28E58] ring-2 ring-[#C28E58]/25",
    accentBg: "bg-[#FAF5EE] dark:bg-[#281A11]",
    accentText: "text-[#523522] dark:text-[#E2BA78]",
    badgeStyle: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  },
  {
    key: "COD_ESCROW",
    title: "Ủy Thác Thanh Toán Khi Nhận Bàn Giao (COD Escrow)",
    subtitle: "Xác lập hợp đồng trước, thanh toán trực tiếp khi nghiệm thu đợt thu hoạch đầu tiên",
    badge: "Đảm Bảo Sản Lượng",
    bankLabel: "Ủy thác COD • Nghiệm thu VietGAP tại chỗ",
    accentBorder: "border-amber-700 dark:border-amber-600 ring-2 ring-amber-600/20",
    accentBg: "bg-amber-50/60 dark:bg-amber-950/25",
    accentText: "text-amber-900 dark:text-amber-300",
    badgeStyle: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300 border-stone-300 dark:border-stone-700",
  },
];

const VOUCHER_PRESETS = [
  { code: "FAASVIP50", title: "FAASVIP50", desc: "Khấu trừ 50.000 VNĐ" },
  { code: "NEWFARMER10", title: "NEWFARMER10", desc: "Chiết khấu 10% hợp đồng" },
  { code: "VIETGAP30", title: "VIETGAP30", desc: "Trợ giá 30.000 VNĐ" },
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

  // Trạng thái Bước 2 (Phiên cổng thanh toán)
  const [sessionData, setSessionData] = useState<PaymentSessionData | null>(null);
  const [countdown, setCountdown] = useState<number>(900);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Thông tin thẻ tín dụng Sandbox
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardHolder, setCardHolder] = useState("LE MINH TAI");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardOtp, setCardOtp] = useState("123456");

  // Trạng thái xử lý giao dịch đa tầng
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

  // Reset state khi mở item mới
  useEffect(() => {
    if (item) {
      setStep(1);
      setSessionData(null);
      setReceiptRecord(null);
      setErrorMessage(null);
      setCountdown(900);
    }
  }, [item]);

  // Đồng hồ đếm ngược ở Bước 2
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

  // Tính toán tạm tính ở Bước 1
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

  // Chuyển từ Bước 1 sang Bước 2 (Khởi tạo phiên thanh toán tại Backend)
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

  // Xác nhận thanh toán ở Bước 2 -> Lưu vào MS SQL Server -> Chuyển sang Bước 3
  const handleConfirmSandboxPayment = async () => {
    setIsConfirming(true);
    setErrorMessage(null);

    try {
      setProcessingStage("Đang đối soát chữ ký số cổng thanh toán MushroomPay...");
      await new Promise((r) => setTimeout(r, 450));

      setProcessingStage(
        item.orderType === "FAAS_RENTAL"
          ? "Đang thực thi sp_CreateRentalOrder (Khóa dòng ROWLOCK, UPDLOCK) trên MS SQL Server..."
          : "Đang ghi nhận chứng từ giao dịch vào bảng dbo.PaymentTransactions..."
      );
      await new Promise((r) => setTimeout(r, 500));

      const bankInfoLabel =
        paymentMethod === "INTERNATIONAL_CARD"
          ? `VISA •••• ${cardNumber.slice(-4)} (${cardHolder})`
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

      setProcessingStage("Đang cấp phát mã định danh khay nuôi và đồng bộ Socket.io...");
      await new Promise((r) => setTimeout(r, 300));

      setReceiptRecord(res.data);
      setStep(3);
      triggerSuccessConfetti();

      if (onTransactionSuccess) {
        onTransactionSuccess(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi xử lý giao dịch tại CSDL. Vui lòng thử lại.");
    } finally {
      setIsConfirming(false);
      setProcessingStage("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Cổng thanh toán điện tử MushroomPay"
    >
      <div className="my-auto w-full max-w-4xl rounded-3xl bg-[#FDFBF8] dark:bg-[#160F0A] border border-[#D9C8B4] dark:border-[#3D271A] shadow-2xl overflow-hidden text-[#24170E] dark:text-[#F5EBE0]">
        {/* Thanh Header Trang Trọng Chuẩn Fintech */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1E130B] via-[#2B1B10] to-[#1A1009] text-white border-b border-[#C28E58]/35 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C28E58] to-[#7C4D2B] flex items-center justify-center shadow-sm border border-[#E8C89B]/40 shrink-0">
              {/* Vector SVG Khiên Bảo Mật Ngân Hàng */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold tracking-wide text-[#FAF5EE] uppercase">
                  Cổng Thanh Toán &amp; Xác Lập Hợp Đồng Điện Tử
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SANDBOX VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-[#D8C4B0] mt-0.5">
                Chuẩn giao dịch ACID MS SQL Server • Chế độ mô phỏng nghiệp vụ (Không trừ tiền thật)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-[#DAC7B5] hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
            title="Đóng cổng thanh toán"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Thanh Tiến Trình 3 Bước (Stepper) */}
        <div className="px-6 py-3 bg-[#F4ECE1] dark:bg-[#1E130C] border-b border-[#E3D5C3] dark:border-[#332014] flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 sm:gap-6 flex-wrap">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#24170E] dark:text-[#E2BA78] font-bold" : "text-[#8C6D53]"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center ${
                step === 1
                  ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08]"
                  : "bg-emerald-700 text-white"
              }`}>
                {step > 1 ? "✓" : "1"}
              </span>
              <span>01. Kê Khai &amp; Chọn Kênh</span>
            </div>

            <span className="text-[#C5B09B] dark:text-[#4A3222]">/</span>

            <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#24170E] dark:text-[#E2BA78] font-bold" : "text-[#8C6D53]"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center ${
                step === 2
                  ? "bg-[#24170E] text-white dark:bg-[#C28E58] dark:text-[#170E08]"
                  : step > 2
                  ? "bg-emerald-700 text-white"
                  : "bg-[#DECFC0] dark:bg-[#332014] text-[#6E4B33]"
              }`}>
                {step > 2 ? "✓" : "2"}
              </span>
              <span>02. Ủy Quyền Thanh Toán</span>
            </div>

            <span className="text-[#C5B09B] dark:text-[#4A3222]">/</span>

            <div className={`flex items-center gap-2 ${step === 3 ? "text-emerald-800 dark:text-emerald-400 font-bold" : "text-[#8C6D53]"}`}>
              <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center ${
                step === 3
                  ? "bg-emerald-700 text-white"
                  : "bg-[#DECFC0] dark:bg-[#332014] text-[#6E4B33]"
              }`}>
                3
              </span>
              <span>03. Chứng Từ &amp; Hợp Đồng CSDL</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#6E4B33] dark:text-[#C28E58]">
            <svg className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>TLS 1.3 • 256-Bit Encrypted</span>
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
              {/* Cột Trái (7 cột): Thông tin chủ hợp đồng & Phương thức thanh toán */}
              <div className="lg:col-span-7 space-y-5">
                {/* Khối 1: Thông tin định danh chủ hợp đồng */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Thông Tin Chủ Thể Hợp Đồng &amp; Nhận Bàn Giao</span>
                    </h4>
                    <span className="text-[10px] font-mono text-[#8C6D53]">Bắt buộc (*)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-[#3B2516] dark:text-[#DAC7B5] mb-1">
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
                      <label className="block font-bold text-[#3B2516] dark:text-[#DAC7B5] mb-1">
                        Số điện thoại liên hệ (*)
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] text-[#24170E] dark:text-white focus:outline-none focus:border-[#C28E58] font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-bold text-[#3B2516] dark:text-[#DAC7B5] mb-1">
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

                {/* Khối 2: Lựa chọn Kênh Thanh Toán (4 Thẻ Đa Sắc Thái) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] flex items-center gap-2 border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2.5">
                    <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span>Lựa Chọn Kênh Thanh Toán Điện Tử</span>
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
                          {/* Biểu tượng Vector SVG riêng cho từng kênh */}
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
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ch.badgeStyle}`}>
                                {ch.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6E533E] dark:text-[#BFA895] mt-1 leading-relaxed">
                              {ch.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cột Phải (5 cột): Bản Kê Chi Phí & Khấu Trừ Thương Mại */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-4 shadow-2xs">
                  <div className="border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C6D53] dark:text-[#C28E58] block">
                      {item.orderType === "FAAS_RENTAL" ? "Hợp Đồng Thuê Khay FaaS" : "Đơn Mua Lô Nông Sản VietGAP"}
                    </span>
                    <h4 className="text-base font-black text-[#24170E] dark:text-white mt-0.5">
                      {item.itemName}
                    </h4>
                    {item.subtitle && (
                      <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">{item.subtitle}</p>
                    )}
                  </div>

                  {/* Thông số kỹ thuật hợp đồng */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                      <span className="text-[10px] text-[#8C6D53] block">Thời hạn / Chu kỳ:</span>
                      <strong className="font-mono text-[#24170E] dark:text-[#E2BA78]">{item.durationLabel}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#261910] border border-[#EAE0D3] dark:border-[#38261A]">
                      <span className="text-[10px] text-[#8C6D53] block">Sản lượng cam kết:</span>
                      <strong className="font-mono text-emerald-800 dark:text-emerald-400">{item.yieldCommitment}</strong>
                    </div>
                  </div>

                  {/* Chọn Mã Ưu Đãi Thương Mại */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-[#3B2516] dark:text-[#DAC7B5]">
                      Mã Ưu Đãi Thương Mại (Voucher):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã ưu đãi"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] text-xs font-mono font-bold uppercase text-[#24170E] dark:text-[#E2BA78] focus:outline-none focus:border-[#C28E58]"
                      />
                      {voucherCode && (
                        <button
                          type="button"
                          onClick={() => setVoucherCode("")}
                          className="px-3 py-2 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-semibold text-[#8C6D53] hover:text-[#24170E] dark:hover:text-white"
                        >
                          Bỏ mã
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
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                              active
                                ? "bg-emerald-800 text-white border-emerald-600"
                                : "bg-[#FAF6F0] dark:bg-[#25170E] text-[#523522] dark:text-[#DAC7B5] border-[#DECFC0] dark:border-[#3D2619] hover:border-[#C28E58]"
                            }`}
                          >
                            {v.title} ({v.desc})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bản kê chi tiết số tiền */}
                  <div className="pt-3 border-t border-[#F0E6D8] dark:border-[#2C1D13] space-y-2 text-xs">
                    <div className="flex justify-between text-[#634936] dark:text-[#BFA895]">
                      <span>Giá trị hợp đồng niêm yết:</span>
                      <span className="font-mono font-semibold text-[#24170E] dark:text-white">{formatVnd(item.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 dark:text-emerald-400">
                      <span>Khấu trừ ưu đãi thương mại:</span>
                      <span className="font-mono font-bold">-{formatVnd(previewDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-[#634936] dark:text-[#BFA895]">
                      <span>Phí bảo hiểm VietGAP &amp; Vận chuyển:</span>
                      <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-400">0 VNĐ (Miễn phí)</span>
                    </div>
                    <div className="pt-2.5 border-t border-[#E3D5C3] dark:border-[#38261A] flex items-baseline justify-between">
                      <span className="font-bold text-sm text-[#24170E] dark:text-white">Tổng Giá Trị Thanh Toán:</span>
                      <span className="font-mono font-black text-xl text-[#8C3A16] dark:text-[#E2BA78]">
                        {formatVnd(previewNetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Ghi chú kỹ thuật CSDL */}
                  <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#24160E] border border-[#E3D5C3] dark:border-[#3D271A] text-[11px] text-[#634936] dark:text-[#BFA895] space-y-1">
                    <div className="font-bold text-[#3B2516] dark:text-[#E2BA78] flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#C28E58] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      </svg>
                      <span>Cam Kết Toàn Vẹn Dữ Liệu MS SQL Server:</span>
                    </div>
                    <p className="leading-relaxed">
                      Hệ thống ghi nhận bút toán vào bảng <code>PaymentTransactions</code>, <code>RentalOrders</code> và cấp phát khay qua khóa <code>ROWLOCK, UPDLOCK</code>.
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
                    <span>{isInitiating ? "Đang khởi tạo phiên giao dịch..." : "Tiếp Tục Đến Cổng Thanh Toán"}</span>
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
              BƯỚC 2: MÀN HÌNH CỔNG THANH TOÁN TƯƠNG TÁC (SANDBOX GATEWAY)
          ============================================================ */}
          {step === 2 && sessionData && (
            <div className="space-y-6">
              {/* Banner Trạng Thái Phiên Giao Dịch & Đồng Hồ Đếm Ngược */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F4ECE1] via-[#FAF6F0] to-[#F4ECE1] dark:from-[#22160E] dark:via-[#1C120B] dark:to-[#22160E] border border-[#DECFC0] dark:border-[#3D271A] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    QR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#24170E] dark:text-white">
                        Mã Tham Chiếu Bút Toán:
                      </span>
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-white dark:bg-[#2C1C12] border border-[#D9C8B5] dark:border-[#4A3222] text-[#8C3A16] dark:text-[#E2BA78]">
                        {sessionData.transactionRef}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E533E] dark:text-[#BFA895] mt-0.5">
                      Chế độ Kiểm thử Sandbox: Mọi xác nhận thanh toán được lưu trực tiếp vào SQL Server mà không trừ tiền tài khoản ngân hàng thật.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#160F0A] border border-[#DECFC0] dark:border-[#38261A]">
                  <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8C6D53] block leading-none">Hiệu lực phiên:</span>
                    <strong className="font-mono text-sm font-black text-[#24170E] dark:text-[#E2BA78]">
                      {formatTime(countdown)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Giao diện chi tiết theo Phương Thức Thanh Toán */}
              {(paymentMethod === "VIETQR_NAPAS" || paymentMethod === "VNPAY_GATEWAY") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Khung Mã QR Ngân Hàng Động */}
                  <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#1E140D] border-2 border-emerald-600/40 dark:border-emerald-500/40 flex flex-col items-center justify-between text-center shadow-sm">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-[#F0E6D8] dark:border-[#2C1D13]">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        {paymentMethod === "VIETQR_NAPAS" ? "VIETQR • NAPAS 247" : "CỔNG VNPAY-QR"}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-[#8C6D53]">
                        BIN: {sessionData.bankInfo.bankBin}
                      </span>
                    </div>

                    <div className="my-4 p-3 rounded-2xl bg-white border border-[#E3D5C3] shadow-inner relative">
                      <img
                        src={sessionData.qrImageUrl}
                        alt="Mã QR Chuyển khoản Ngân hàng VietQR"
                        className="w-52 h-52 object-contain mx-auto"
                      />
                    </div>

                    <p className="text-[11px] text-[#634936] dark:text-[#BFA895] leading-relaxed">
                      Mã QR chứa sẵn số tiền <strong className="font-mono text-[#24170E] dark:text-white">{formatVnd(sessionData.netAmount)}</strong> và nội dung định danh <strong className="font-mono text-[#24170E] dark:text-white">{sessionData.bankInfo.transferMemo}</strong>.
                    </p>
                  </div>

                  {/* Thông tin Tài Khoản Thụ Hưởng & Xác Nhận Sandbox */}
                  <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2.5">
                        Thông Tin Tài Khoản Thụ Hưởng Doanh Nghiệp
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-[#8C6D53] block">Ngân hàng thụ hưởng:</span>
                            <strong className="text-[#24170E] dark:text-white">{sessionData.bankInfo.bankName}</strong>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                            Napas 247
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-[#8C6D53] block">Chủ tài khoản định danh:</span>
                            <strong className="font-mono text-[#24170E] dark:text-white">{sessionData.bankInfo.accountName}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#8C6D53] block">Số tài khoản:</span>
                              <strong className="font-mono text-sm text-[#24170E] dark:text-[#E2BA78]">{sessionData.bankInfo.accountNo}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy("0382482793", "ACCOUNT")}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1009] border border-[#D9C8B5] dark:border-[#4A3222] text-[10px] font-bold text-[#523522] dark:text-[#E2BA78] hover:border-[#C28E58] cursor-pointer"
                            >
                              {copiedField === "ACCOUNT" ? "Đã chép" : "Sao chép"}
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#261810] border border-[#EAE0D3] dark:border-[#38261A] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#8C6D53] block">Nội dung chuyển khoản:</span>
                              <strong className="font-mono text-sm text-emerald-800 dark:text-emerald-400">{sessionData.bankInfo.transferMemo}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(sessionData.bankInfo.transferMemo, "MEMO")}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1009] border border-[#D9C8B5] dark:border-[#4A3222] text-[10px] font-bold text-[#523522] dark:text-[#E2BA78] hover:border-[#C28E58] cursor-pointer"
                            >
                              {copiedField === "MEMO" ? "Đã chép" : "Sao chép"}
                            </button>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">Số Tiền Cần Thanh Toán:</span>
                          <strong className="font-mono text-lg font-black text-emerald-800 dark:text-emerald-300">
                            {formatVnd(sessionData.netAmount)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Trạng thái đang xử lý hoặc Nút Xác Nhận */}
                    {isConfirming ? (
                      <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#C28E58] text-xs space-y-2">
                        <div className="flex items-center gap-2.5 font-bold text-[#24170E] dark:text-[#E2BA78]">
                          <span className="w-4 h-4 rounded-full border-2 border-[#C28E58] border-t-transparent animate-spin shrink-0"></span>
                          <span>{processingStage}</span>
                        </div>
                        <p className="text-[11px] text-[#735843] dark:text-[#BFA895] pl-6">
                          Hệ thống đang ghi dữ liệu vào bảng RentalOrders, CultivationTrays và PaymentTransactions...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center gap-3">
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
                            <span>Xác Nhận Đã Chuyển Khoản (Mô Phỏng Báo Có)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Giao diện Thẻ Quốc Tế (Visa / Mastercard Sandbox) */}
              {paymentMethod === "INTERNATIONAL_CARD" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Mô phỏng Thẻ Tín Dụng Kim Loại 3D */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#1E293B] to-[#0F172A] text-white border border-[#C28E58]/50 shadow-xl space-y-6 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        {/* Chip từ EMV Vector */}
                        <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-[#C28E58] via-[#E8C89B] to-[#A67442] border border-amber-200/50 flex items-center justify-center">
                          <div className="w-7 h-5 border border-[#523522]/40 rounded-xs grid grid-cols-2"></div>
                        </div>
                        <span className="font-mono text-xs font-bold tracking-widest text-[#E2BA78] uppercase">
                          VISA INFINITE • SANDBOX
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                          Số Thẻ Tín Dụng / Ghi Nợ Quốc Tế
                        </span>
                        <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-[#FAF5EE]">
                          {cardNumber || "4242 •••• •••• 4242"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs">
                        <div>
                          <span className="text-[9px] uppercase text-slate-400 block">Chủ Thẻ (Cardholder)</span>
                          <strong className="font-mono tracking-wider text-white uppercase">{cardHolder || "LE MINH TAI"}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase text-slate-400 block">Hiệu Lực</span>
                          <strong className="font-mono text-[#E2BA78]">{cardExpiry || "12/28"}</strong>
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
                      Điền Nhanh Thẻ Thử Nghiệm Chuẩn Sandbox (4242 •••• 4242)
                    </button>
                  </div>

                  {/* Form Ủy Quyền Thẻ Quốc Tế */}
                  <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5 text-xs">
                      <h4 className="font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#E2BA78] border-b border-[#F0E6D8] dark:border-[#2C1D13] pb-2.5">
                        Thông Tin Ủy Quyền Thẻ Quốc Tế (3D-Secure 2.0)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">Số thẻ (Card Number)</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Tên in trên thẻ (Cardholder)</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-mono font-bold uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold mb-1">Hết hạn (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Mã bảo mật CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={4}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF7F2] dark:bg-[#261810] font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Mã OTP Sandbox</label>
                          <input
                            type="text"
                            value={cardOtp}
                            onChange={(e) => setCardOtp(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 font-mono font-bold text-emerald-800 dark:text-emerald-300"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF5EE] dark:bg-[#261810] border border-[#DECFC0] dark:border-[#3D271A] flex items-center justify-between">
                        <span className="font-bold">Tổng số tiền khấu trừ (Mô phỏng Sandbox):</span>
                        <strong className="font-mono text-lg font-black text-[#8C3A16] dark:text-[#E2BA78]">
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
                          Ủy Quyền Thanh Toán Thẻ &amp; Ghi Nhận CSDL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Giao diện Ủy Thác Giao Nhận COD Escrow */}
              {paymentMethod === "COD_ESCROW" && (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#1E140D] border border-[#E3D5C3] dark:border-[#38261A] space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Xác Nhận Cam Kết Ủy Thác Thanh Toán Khi Nhận Bàn Giao (COD Escrow)
                    </h4>
                    <p className="text-xs text-[#634936] dark:text-[#BFA895] leading-relaxed">
                      Hệ thống sẽ cấp phát ngay khay nấm vô trùng trong CSDL <code>SmartMushroomDB</code> và kích hoạt quy trình nuôi trồng. Khoản phí <strong className="font-mono text-[#24170E] dark:text-white">{formatVnd(sessionData.netAmount)}</strong> sẽ được thanh toán trực tiếp khi nhân viên bàn giao đợt nấm thu hoạch đầu tiên tại địa chỉ: <strong className="text-[#24170E] dark:text-white">{deliveryAddress}</strong>.
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
                        Xác Lập Hợp Đồng Ủy Thác &amp; Cấp Phát Khay Ngay
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              BƯỚC 3: CHỨNG TỪ GIAO DỊCH & HỢP ĐỒNG ĐIỆN TỬ ĐÃ LƯU CSDL
          ============================================================ */}
          {step === 3 && receiptRecord && (
            <div className="space-y-6">
              {/* Khung Chứng Từ Ngân Hàng & Hợp Đồng */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C120B] border-2 border-[#C28E58] shadow-xl relative overflow-hidden space-y-6">
                {/* Con dấu Vector Xác Thực Đã Lưu CSDL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-dashed border-[#DECFC0] dark:border-[#3D271A]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 block">
                        CHỨNG TỪ GIAO DỊCH ĐÃ GHI NHẬN VÀO MS SQL SERVER
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-[#24170E] dark:text-white">
                        Hợp Đồng Điện Tử &amp; Biên Lai Thu Tiền
                      </h4>
                    </div>
                  </div>

                  {/* Con dấu mộc trang trọng */}
                  <div className="px-3.5 py-1.5 rounded-xl border-2 border-emerald-700 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-black uppercase tracking-wider self-start sm:self-center">
                    ĐÃ QUYẾT TOÁN • PAID
                  </div>
                </div>

                {/* Bảng thông tin 2 cột chuẩn chứng từ ngân hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#24170F] border border-[#EAE0D3] dark:border-[#38261A] space-y-2.5">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C6D53] border-b border-[#EAE0D3] dark:border-[#38261A] pb-1.5">
                      I. Định Danh Bút Toán &amp; Cơ Sở Dữ Liệu
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Mã bút toán (TransactionRef):</span>
                      <strong className="font-mono text-[#24170E] dark:text-[#E2BA78]">{receiptRecord.transactionRef}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Mã hợp đồng CSDL (OrderCode):</span>
                      <strong className="font-mono text-emerald-800 dark:text-emerald-400">{receiptRecord.orderCode}</strong>
                    </div>
                    {receiptRecord.trayCode && (
                      <div className="flex justify-between">
                        <span className="text-[#6E533E] dark:text-[#BFA895]">Mã khay vật lý được cấp phát:</span>
                        <strong className="font-mono text-[#8C3A16] dark:text-amber-300">
                          {receiptRecord.trayCode} (Khay #{receiptRecord.trayId})
                        </strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Phương thức thanh toán:</span>
                      <strong className="text-[#24170E] dark:text-white">{receiptRecord.bankOrCardInfo || receiptRecord.paymentMethod}</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#24170F] border border-[#EAE0D3] dark:border-[#38261A] space-y-2.5">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C6D53] border-b border-[#EAE0D3] dark:border-[#38261A] pb-1.5">
                      II. Thông Tin Chủ Sở Hữu &amp; Giá Trị Quyết Toán
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Chủ thể hợp đồng:</span>
                      <strong className="text-[#24170E] dark:text-white">{receiptRecord.customerName} ({receiptRecord.customerPhone})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Hạng mục đăng ký:</span>
                      <strong className="text-[#24170E] dark:text-white">{receiptRecord.itemName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E533E] dark:text-[#BFA895]">Khấu trừ ưu đãi:</span>
                      <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                        -{formatVnd(receiptRecord.discountAmount)} {receiptRecord.voucherCode ? `(${receiptRecord.voucherCode})` : ""}
                      </strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#EAE0D3] dark:border-[#38261A]">
                      <span className="font-bold text-[#24170E] dark:text-white">Tổng Thực Thu (Đã Lưu CSDL):</span>
                      <strong className="font-mono text-base font-black text-[#8C3A16] dark:text-[#E2BA78]">
                        {formatVnd(receiptRecord.netAmount)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    Bản ghi đã được lưu trữ an toàn vào bảng <code>dbo.PaymentTransactions</code> và <code>dbo.RentalOrders</code>. Bạn có thể kiểm tra ngay ở bảng Sổ Cái Giao Dịch bên dưới trang.
                  </span>
                  <span className="font-mono text-[11px] font-bold">
                    Realtime Socket: tray:occupied
                  </span>
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

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Hoàn Tất &amp; Xem Sổ Cái Giao Dịch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
