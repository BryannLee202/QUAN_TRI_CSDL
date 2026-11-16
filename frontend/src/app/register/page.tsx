"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [isBusinessOrOperator, setIsBusinessOrOperator] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("Vui lòng điền đầy đủ họ tên, email và mật khẩu.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Mật khẩu phải có độ dài tối thiểu 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
        address: address.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setErrorMsg(res.message || "Đăng ký không thành công. Vui lòng thử lại.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi máy chủ khi đăng ký tài khoản.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] dark:bg-[#120B07] text-[#24170E] dark:text-[#F5EBE1] flex flex-col font-sans transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full border-b border-[#E8DCCE] dark:border-[#2D1D13] bg-white/80 dark:bg-[#1A1009]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#52331E] to-[#C28E58] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-base">🍄</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#24170E] dark:text-[#FFF5EA]">
                MushroomCloud
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D53] dark:text-[#B59D89]">
              Smart Farm FaaS Platform
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] text-xs font-semibold hover:bg-[#FAF5EE] dark:hover:bg-[#281A12] text-[#523522] dark:text-[#E2BA78] transition shadow-2xs"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Quay về Trang chủ</span>
        </Link>
      </header>

      {/* Main Body Split Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl bg-white dark:bg-[#1C120B] rounded-3xl border border-[#DECFC0] dark:border-[#38261A] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Left Column: Brand & Value Proposition Showcase */}
          <div className="lg:w-[42%] bg-gradient-to-br from-[#FAF5EE] via-[#F4EBE0] to-[#EAE0D2] dark:from-[#24170E] dark:via-[#1E130B] dark:to-[#170E08] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DECFC0] dark:border-[#38261A]">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-[#2F1F15]/90 border border-[#D9C8B5] dark:border-[#4A3222] shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-[#6B442C] dark:text-[#E2BA78] tracking-wide uppercase">
                  MushroomCloud • Nông Trại FaaS
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24170E] dark:text-[#FFF5EA] leading-tight tracking-tight">
                Gia Nhập Cộng Đồng Nông Trại Thông Minh
              </h2>
              <p className="text-xs sm:text-sm text-[#735843] dark:text-[#BFA895] mt-2.5 leading-relaxed">
                Đăng ký tài khoản để sở hữu khay nấm vô trùng, theo dõi quá trình phát triển qua camera PTZ 4K và nhận nấm dược liệu VietGAP tươi tại nhà.
              </p>

              {/* Chamber Visual Box */}
              <div className="mt-5 relative rounded-2xl overflow-hidden border border-[#D9C8B5] dark:border-[#4A3222] shadow-md group">
                <div className="relative h-44 w-full bg-[#3B2414]">
                  <Image
                    src="/images/duyet-phuong-an-2-champagne-am.jpg"
                    alt="Phòng Nuôi Trồng Nấm Sạch"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Chuẩn VietGAP Loại A</span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-bold leading-tight">Buồng Kính Lập Phương Cao Cấp</p>
                      <p className="text-[10px] text-amber-200">Bảo hiểm 100% rủi ro năng suất</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white">ISO Class 5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="mt-5 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1E130B]/80 border border-[#E5D7C7] dark:border-[#38261A] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE0D2] dark:bg-[#2D1E13] flex items-center justify-center text-xs text-[#6B442C] dark:text-[#E2BA78] shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">Thuê Khay Trực Tuyến Linh Hoạt</h4>
                    <p className="text-[11px] text-[#735843] dark:text-[#BFA895] leading-tight mt-0.5">
                      Gói dịch vụ 30 - 90 ngày cho các loại nấm Bào Ngư, Linh Chi, Đông Trùng Hạ Thảo.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1E130B]/80 border border-[#E5D7C7] dark:border-[#38261A] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE0D2] dark:bg-[#2D1E13] flex items-center justify-center text-xs text-[#6B442C] dark:text-[#E2BA78] shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">Cảnh Báo Tự Động & Deep-link</h4>
                    <p className="text-[11px] text-[#735843] dark:text-[#BFA895] leading-tight mt-0.5">
                      Nhận thông báo đẩy tức thời khi nấm đạt độ nở chuẩn thu hoạch hoặc vi khí hậu biến thiên.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#1E130B]/80 border border-[#E5D7C7] dark:border-[#38261A] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE0D2] dark:bg-[#2D1E13] flex items-center justify-center text-xs text-[#6B442C] dark:text-[#E2BA78] shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">Bảo Vệ Quyền Riêng Tư & Dữ Liệu</h4>
                    <p className="text-[11px] text-[#735843] dark:text-[#BFA895] leading-tight mt-0.5">
                      Mã hóa mật khẩu BCrypt, phòng thủ CSRF và JWT cookie HttpOnly an toàn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DECFC0] dark:border-[#38261A] text-[11px] text-[#8C6D53] dark:text-[#9E8675] flex items-center justify-between">
              <span>Đồ án môn Quản Trị CSDL Nâng Cao</span>
              <span className="font-semibold">HCMUTE • 2026</span>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:w-[58%] p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Form Header */}
              <div className="mb-5">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF5EE] dark:bg-[#281A12] border border-[#E5D7C7] dark:border-[#3D2517] text-[10px] font-bold text-[#8C6D53] dark:text-[#D4A373] uppercase tracking-wider mb-1.5">
                  Đăng Ký Thành Viên Mới
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                  Tạo tài khoản nông trại
                </h1>
                <p className="text-xs sm:text-sm text-[#735843] dark:text-[#BFA895] mt-1">
                  Trở thành chủ sở hữu khay nấm thông minh với quyền giám sát thời gian thực.
                </p>
              </div>

              {/* Alert Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1">
                      Họ và tên khách hàng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FCFBF8] dark:bg-[#120B07] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1">
                      Số điện thoại nhận thông báo
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0901234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FCFBF8] dark:bg-[#120B07] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                    />
                  </div>
                </div>

                {/* Optional Role / Business Toggle (Similar to Running Man reference) */}
                <div className="p-2.5 rounded-xl bg-[#FAF5EE] dark:bg-[#20150D] border border-[#E5D7C7] dark:border-[#3D2517] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="operatorRoleToggle"
                      checked={isBusinessOrOperator}
                      onChange={(e) => setIsBusinessOrOperator(e.target.checked)}
                      className="w-4 h-4 rounded border-[#D9C8B5] text-[#52331E] focus:ring-[#C28E58]"
                    />
                    <label htmlFor="operatorRoleToggle" className="text-xs text-[#523522] dark:text-[#DAC7B5] cursor-pointer">
                      Đăng ký quyền <strong>Kỹ Thuật Viên / Chủ Trang Trại Đối Tác</strong>
                    </label>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE0D2] dark:bg-[#38261A] text-[#8C6D53] dark:text-[#B59D89] font-semibold">
                    {isBusinessOrOperator ? "Cần phê duyệt" : "Mặc định Khách hàng"}
                  </span>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1">
                    Địa chỉ Email đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@email.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FCFBF8] dark:bg-[#120B07] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        required
                        className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FCFBF8] dark:bg-[#120B07] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C6D53]"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1">
                      Xác nhận mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FCFBF8] dark:bg-[#120B07] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                    />
                  </div>
                </div>

                {/* Password Security Requirement Hint (As in Reference) */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300/90 leading-snug space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Quy chuẩn mật khẩu an toàn chống tấn công:</span>
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 text-[10px] pl-5 list-disc">
                    <div>• Tối thiểu 8 ký tự</div>
                    <div>• Khuyên dùng có chữ in hoa (A-Z)</div>
                    <div>• Khuyên dùng có số (0-9)</div>
                    <div>• Ký tự đặc biệt (@, #, $, ...)</div>
                  </div>
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1">
                    Địa chỉ nhận nấm tươi sau thu hoạch (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-[#FCFBF8] dark:bg-[#120B07] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#4A2E1D] via-[#5C3A24] to-[#3B2212] hover:from-[#3D2517] hover:to-[#24140B] shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Đang khởi tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo tài khoản khách hàng nông trại</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Link to Login */}
            <div className="mt-6 pt-4 border-t border-[#F0E6D8] dark:border-[#2D1D13] text-center text-xs text-[#735843] dark:text-[#BFA895]">
              Đã có tài khoản nông trại?{" "}
              <Link href="/login" className="font-bold text-[#C28E58] hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
