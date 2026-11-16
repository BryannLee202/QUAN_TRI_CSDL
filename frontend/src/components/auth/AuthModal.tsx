"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await login(demoEmail, demoPass);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (authModalTab === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      } else {
        const res = await register({
          fullName,
          email,
          password,
          phoneNumber,
          address,
        });
        if (!res.success) {
          setErrorMsg(res.message);
        } else {
          setSuccessMsg("Đăng ký thành công! Đang đăng nhập...");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#FAF7F2] dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#4A3222] shadow-2xl text-[#24170E] dark:text-[#F7EFE6] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-6 bg-gradient-to-r from-[#3B2212] via-[#523522] to-[#24170E] text-[#FFF5EA] relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FFF5EA] flex items-center justify-center transition"
            aria-label="Đóng"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C28E58] text-white flex items-center justify-center shadow-md shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-[#FFF5EA] tracking-tight">
                {authModalTab === "login" ? "Đăng Nhập MushroomCloud" : "Đăng Ký Tài Khoản Nông Trại"}
              </h3>
              <p className="text-xs text-[#E8DCCE]">
                Nền tảng Nông Trại Thông Minh Farm-as-a-Service (FaaS)
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex mt-4 bg-black/25 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                openAuthModal("login");
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authModalTab === "login"
                  ? "bg-[#C28E58] text-white shadow-xs"
                  : "text-[#DAC7B5] hover:text-white"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                openAuthModal("register");
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authModalTab === "register"
                  ? "bg-[#C28E58] text-white shadow-xs"
                  : "text-[#DAC7B5] hover:text-white"
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>
        </div>

        {/* Thân Modal */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Thông báo lỗi / thành công */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Nhập Liệu */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalTab === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#523522] dark:text-[#D4AF7A] mb-1">
                  Họ và Tên Khách Hàng / Đơn Vị *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#20140D] text-xs focus:ring-2 focus:ring-[#C28E58] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#523522] dark:text-[#D4AF7A] mb-1">
                Địa Chỉ Email Đăng Nhập *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#20140D] text-xs focus:ring-2 focus:ring-[#C28E58] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#523522] dark:text-[#D4AF7A] mb-1">
                Mật Khẩu *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#20140D] text-xs focus:ring-2 focus:ring-[#C28E58] focus:outline-none"
              />
            </div>

            {authModalTab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#523522] dark:text-[#D4AF7A] mb-1">
                    Số Điện Thoại Nhận Thông Báo
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#20140D] text-xs focus:ring-2 focus:ring-[#C28E58] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#523522] dark:text-[#D4AF7A] mb-1">
                    Địa Chỉ Giao Nấm Tươi
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận/huyện, TP.HCM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#20140D] text-xs focus:ring-2 focus:ring-[#C28E58] focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#4A2E1D] via-[#5C3A24] to-[#3B2212] hover:from-[#3D2517] hover:to-[#24140B] text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 border border-[#6B442C]/40"
            >
              <span>{isLoading ? "Đang xử lý..." : authModalTab === "login" ? "Đăng Nhập Ngay" : "Tạo Tài Khoản Khách Hàng"}</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.333 8h9.334M8.667 4l4 4-4 4"/></svg>
            </button>
          </form>

          {/* Khối Đăng Nhập Nhanh Demo 1-Click (Dành cho kiểm thử & chấm đồ án) */}
          <div className="pt-4 border-t border-[#DECFC0] dark:border-[#38261A]">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#C28E58]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#735843] dark:text-[#D4AF7A]">
                1-Click Demo Accounts (Kiểm thử đồ án)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@mushroomcloud.test", "Password123@")}
                className="p-2.5 rounded-xl bg-white dark:bg-[#22160E] border border-[#DECFC0] dark:border-[#422C1D] hover:border-[#C28E58] text-left transition group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A5C38] dark:text-[#E2BA78]">
                  <span>Quản Trị Viên</span>
                </div>
                <p className="text-[10px] text-[#735843] dark:text-[#BFA895] truncate">admin@mushroomcloud</p>
                <span className="mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded-sm bg-[#FAF5EE] dark:bg-[#150D07] text-[#C28E58] font-mono">
                  Full Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("operator1@mushroomcloud.test", "Password123@")}
                className="p-2.5 rounded-xl bg-white dark:bg-[#22160E] border border-[#DECFC0] dark:border-[#422C1D] hover:border-[#C28E58] text-left transition group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Kỹ Thuật Viên</span>
                </div>
                <p className="text-[10px] text-[#735843] dark:text-[#BFA895] truncate">operator1@mushroom</p>
                <span className="mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                  Operator
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("customer1@mushroomcloud.test", "Password123@")}
                className="p-2.5 rounded-xl bg-white dark:bg-[#22160E] border border-[#DECFC0] dark:border-[#422C1D] hover:border-[#C28E58] text-left transition group shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#523522] dark:text-[#E2BA78]">
                  <span>Khách Hàng</span>
                </div>
                <p className="text-[10px] text-[#735843] dark:text-[#BFA895] truncate">customer1@mushroom</p>
                <span className="mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono">
                  Customer
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
