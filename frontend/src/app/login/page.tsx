"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Nếu người dùng đã đăng nhập từ trước, điều hướng về trang tương ứng
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Admin" || user.role === "Operator") {
        router.push("/operator");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
        setTimeout(() => {
          if (res.user?.role === "Admin" || res.user?.role === "Operator") {
            router.push("/operator");
          } else {
            router.push("/");
          }
        }, 800);
      } else {
        setErrorMsg(res.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] dark:bg-[#1E1B18] text-[#24170E] dark:text-[#F5EBE1] flex flex-col font-sans transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full border-b border-[#E8DCCE] dark:border-[#2D1D13] bg-white/80 dark:bg-[#1E1B18]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo - Đồng bộ 100% với Navbar */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:via-[#27231F] dark:to-[#1E1B18] border border-[#D9C8B5] dark:border-[#474039] shadow-xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="login-brand-coffee-grad" x1="12" y1="8" x2="56" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4A2E1D" />
                  <stop offset="0.6" stopColor="#6B442C" />
                  <stop offset="1" stopColor="#9E6845" />
                </linearGradient>
                <linearGradient id="login-brand-bronze-grad" x1="20" y1="20" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C28E58" />
                  <stop offset="1" stopColor="#E2B888" />
                </linearGradient>
              </defs>
              <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="url(#login-brand-coffee-grad)" />
              <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="url(#login-brand-bronze-grad)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="url(#login-brand-coffee-grad)" />
              <circle cx="34" cy="20" r="3" fill="url(#login-brand-bronze-grad)" />
              <circle cx="23" cy="22" r="2" fill="#C28E58" />
              <circle cx="45" cy="22" r="2" fill="#C28E58" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-1.5 font-sans">
              MushroomCloud
              <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58]"></span>
            </span>
            <span className="text-[10px] font-bold text-[#8A5C38] dark:text-[#D4AF7A] tracking-wider uppercase -mt-0.5">
              Smart Farm FaaS
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#D9C8B5] dark:border-[#474039] text-xs font-semibold hover:bg-[#FAF5EE] dark:hover:bg-[#3C3630] text-[#523522] dark:text-[#E2BA78] transition shadow-2xs"
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
        <div className="w-full max-w-5xl bg-white dark:bg-[#1C120B] rounded-3xl border border-[#DECFC0] dark:border-[#474039] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Left Column: Brand & Value Proposition Showcase */}
          <div className="lg:w-[44%] bg-gradient-to-br from-[#FAF5EE] via-[#F4EBE0] to-[#EAE0D2] dark:from-[#24170E] dark:via-[#27231F] dark:to-[#1E1B18] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DECFC0] dark:border-[#474039]">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-[#2F1F15]/90 border border-[#D9C8B5] dark:border-[#474039] shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold text-[#6B442C] dark:text-[#E2BA78] tracking-wide uppercase">
                  MushroomCloud • Nông Trại FaaS
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24170E] dark:text-[#FFF5EA] leading-tight tracking-tight">
                Làm Chủ Nông Trại Nấm Thông Minh Từ Xa
              </h2>
              <p className="text-xs sm:text-sm text-[#735843] dark:text-[#BFA895] mt-2.5 leading-relaxed">
                Thuê khay nấm chuẩn vô trùng ISO Class 5, kiểm soát vi khí hậu bằng cảm biến IoT và xem trực tiếp nấm phát triển 24/7 qua camera 4K.
              </p>

              {/* Chamber Visual Box */}
              <div className="mt-5 relative rounded-2xl overflow-hidden border border-[#D9C8B5] dark:border-[#474039] shadow-md group">
                <div className="relative h-44 w-full bg-[#3B2414]">
                  <Image
                    src="/images/duyet-phuong-an-2-champagne-am.jpg"
                    alt="Buồng Nấm Thông Minh MushroomCloud"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Live 4K Stream</span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-bold leading-tight">Buồng Nuôi ISO Class 5 • RM-01</p>
                      <p className="text-[10px] text-amber-200">Bào Ngư Xám & Linh Chi Đỏ Dược Liệu</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white">24.5°C • 88%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="mt-5 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#27231F]/80 border border-[#E5D7C7] dark:border-[#474039] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE0D2] dark:bg-[#2D1E13] flex items-center justify-center text-xs text-[#6B442C] dark:text-[#E2BA78] shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">Khay Nấm Định Danh Mã QR</h4>
                    <p className="text-[11px] text-[#735843] dark:text-[#BFA895] leading-tight mt-0.5">
                      Mỗi khách hàng sở hữu khay nấm độc lập, truy xuất nguồn gốc VietGAP minh bạch.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#27231F]/80 border border-[#E5D7C7] dark:border-[#474039] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE0D2] dark:bg-[#2D1E13] flex items-center justify-center text-xs text-[#6B442C] dark:text-[#E2BA78] shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">Cam Kết Sản Lượng Có Bảo Hiểm</h4>
                    <p className="text-[11px] text-[#735843] dark:text-[#BFA895] leading-tight mt-0.5">
                      Bù sản lượng nếu không đạt định mức, hỗ trợ sấy thăng hoa và giao nấm tận nhà.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#27231F]/80 border border-[#E5D7C7] dark:border-[#474039] flex items-start gap-2.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#EAE0D2] dark:bg-[#2D1E13] flex items-center justify-center text-xs text-[#6B442C] dark:text-[#E2BA78] shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#24170E] dark:text-[#FFF5EA]">CSDL Khóa Dòng Giao Dịch ACID</h4>
                    <p className="text-[11px] text-[#735843] dark:text-[#BFA895] leading-tight mt-0.5">
                      Bảo mật T-SQL ROWLOCK chống tranh chấp đơn thuê và bảo vệ tài khoản tối đa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:w-[56%] p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Form Header */}
              <div className="mb-6">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FAF5EE] dark:bg-[#322D28] border border-[#E5D7C7] dark:border-[#3D2517] text-[10px] font-bold text-[#8C6D53] dark:text-[#D4A373] uppercase tracking-wider mb-2">
                  Cổng Đăng Nhập Hệ Thống
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24170E] dark:text-[#FFF5EA] tracking-tight">
                  Đăng nhập tài khoản
                </h1>
                <p className="text-xs sm:text-sm text-[#735843] dark:text-[#BFA895] mt-1.5">
                  Truy cập khay nấm của bạn, giám sát vi khí hậu và theo dõi quy trình thu hoạch.
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

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78] mb-1.5">
                    Tên tài khoản hoặc Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C6D53]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenban@mushroomcloud.test hoặc email cá nhân"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#474039] bg-[#FCFBF8] dark:bg-[#1E1B18] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#422917] dark:text-[#E2BA78]">
                      Mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Mật khẩu dùng thử chuẩn đồ án là: Password123@")}
                      className="text-[11px] text-[#C28E58] hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C6D53]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#474039] bg-[#FCFBF8] dark:bg-[#1E1B18] text-[#24170E] dark:text-[#FFF5EA] text-xs focus:ring-2 focus:ring-[#C28E58] focus:border-transparent outline-none transition shadow-2xs placeholder-[#A89280]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C6D53] hover:text-[#523522] dark:hover:text-[#FFF5EA]"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#523522] dark:text-[#DAC7B5]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#D9C8B5] text-[#52331E] focus:ring-[#C28E58]"
                    />
                    <span>Ghi nhớ phiên đăng nhập trên thiết bị này</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#4A2E1D] via-[#5C3A24] to-[#3B2212] hover:from-[#3D2517] hover:to-[#24140B] shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Đang xác thực thông tin...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập vào hệ thống MushroomCloud</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Accounts (Dành cho Giảng Viên & Chấm Thi Đồ Án) */}
              <div className="mt-6 pt-5 border-t border-[#F0E6D8] dark:border-[#2D1D13]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D53] dark:text-[#B59D89]">
                    ⚡ Tài Khoản Dùng Thử 1-Click (Kiểm Thử Đồ Án)
                  </span>
                  <span className="text-[10px] text-[#A89280]">Mật khẩu chung: Password123@</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo("admin@mushroomcloud.test", "Password123@")}
                    className="p-2.5 rounded-xl border border-[#DECFC0] dark:border-[#474039] bg-[#FAF5EE] dark:bg-[#27231F] hover:border-[#C28E58] transition text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#24170E] dark:text-[#FFF5EA]">Quản Trị Viên</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">Admin</span>
                    </div>
                    <p className="text-[10px] text-[#8C6D53] truncate mt-0.5">admin@mushroomcloud.test</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo("operator1@mushroomcloud.test", "Password123@")}
                    className="p-2.5 rounded-xl border border-[#DECFC0] dark:border-[#474039] bg-[#FAF5EE] dark:bg-[#27231F] hover:border-[#C28E58] transition text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#24170E] dark:text-[#FFF5EA]">Kỹ Thuật Viên</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">Operator</span>
                    </div>
                    <p className="text-[10px] text-[#8C6D53] truncate mt-0.5">operator1@mushroomcloud.test</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo("customer1@mushroomcloud.test", "Password123@")}
                    className="p-2.5 rounded-xl border border-[#DECFC0] dark:border-[#474039] bg-[#FAF5EE] dark:bg-[#27231F] hover:border-[#C28E58] transition text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#24170E] dark:text-[#FFF5EA]">Khách Hàng</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">Customer</span>
                    </div>
                    <p className="text-[10px] text-[#8C6D53] truncate mt-0.5">customer1@mushroomcloud.test</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Link to Register */}
            <div className="mt-8 pt-4 border-t border-[#F0E6D8] dark:border-[#2D1D13] text-center text-xs text-[#735843] dark:text-[#BFA895]">
              Chưa có tài khoản nông trại?{" "}
              <Link href="/register" className="font-bold text-[#C28E58] hover:underline">
                Đăng ký thành viên ngay
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
