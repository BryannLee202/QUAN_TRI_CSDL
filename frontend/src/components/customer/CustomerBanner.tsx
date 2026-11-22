"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerBanner() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FAF5EE] via-[#F5ECE1] to-[#EFE2D3] dark:from-[#25170F] dark:via-[#1E120A] dark:to-[#1E1B18] border border-[#D9C8B5] dark:border-[#474039] flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6B442C] to-[#C28E58] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "K"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">
                Xin chào, {user.fullName}!
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-[#FAF5EE] dark:bg-[#1E1B18] text-[#C28E58] border border-[#DECFC0] dark:border-[#474039]">
                {user.role}
              </span>
            </div>
            <p className="text-[11px] text-[#735843] dark:text-[#BFA895] mt-0.5">
              Hệ thống đang phát luồng trực tiếp khay nấm cá nhân và đồng bộ vi khí hậu 24/7 theo tài khoản của bạn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Khay nấm hoạt động tốt</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-fade-in text-slate-800">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">🍄</span>
        <div>
          <span className="font-bold text-slate-900 text-sm">
            Bạn đang quan sát buồng nấm chế độ Demo mẫu.
          </span>
          <p className="text-xs text-slate-600 mt-0.5">
            Đăng nhập tài khoản khách hàng để kết nối trực tiếp với khay nấm và kích hoạt quyền yêu cầu thu hoạch.
          </p>
        </div>
      </div>

      <Link
        href="/login"
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
      >
        Đăng Nhập Khách Hàng
      </Link>
    </div>
  );
}
