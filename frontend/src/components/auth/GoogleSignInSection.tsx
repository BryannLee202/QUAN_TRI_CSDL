"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInSectionProps {
  label?: string;
  onSuccess?: () => void;
}

export default function GoogleSignInSection({
  label = "Đăng nhập bằng tài khoản Google (Gmail)",
  onSuccess,
}: GoogleSignInSectionProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Lắng nghe Google Client ID từ biến môi trường nếu có
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Tự động tải Google Identity Services script
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGsi = () => {
      if (googleClientId && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });

          const btnEl = document.getElementById("google-official-btn");
          if (btnEl) {
            btnEl.innerHTML = "";
            window.google.accounts.id.renderButton(btnEl, {
              type: "standard",
              shape: "rectangular",
              theme: "outline",
              text: "continue_with",
              size: "large",
              logo_alignment: "center",
              width: 380,
            });
          }
        } catch (e) {
          console.warn("[Google GSI Init Warning]:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initGsi();
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initGsi);
      }
    }
  }, [googleClientId]);

  // Xử lý khi Google trả về credential JWT thật
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle({ credential: response.credential });
      if (res.success) {
        setIsModalOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(res.user?.role === "Admin" || res.user?.role === "Operator" ? "/operator" : "/");
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Lỗi xác thực với Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // Kích hoạt khi người dùng bấm nút Google
  const handleClickGoogleButton = () => {
    // Nếu có Google Client ID hợp lệ và GIS đã sẵn sàng, thử mở prompt của Google
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Nếu bị chặn popup hoặc One Tap bỏ qua -> mở modal chọn tài khoản
            setIsModalOpen(true);
          }
        });
        return;
      } catch {
        // Fallback mở modal
      }
    }
    // Mở modal xác thực Google trực quan
    setIsModalOpen(true);
    setErrorMsg(null);
  };

  // Đăng nhập nhanh bằng tài khoản Google được chọn
  const handleSelectAccount = async (email: string, name: string, avatarUrl?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle({
        email,
        fullName: name,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      });
      if (res.success) {
        setIsModalOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(res.user?.role === "Admin" || res.user?.role === "Operator" ? "/operator" : "/");
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Đăng nhập Google thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng nhập bằng Gmail tự nhập
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ Gmail của bạn.");
      return;
    }
    const cleanEmail = customEmail.trim().toLowerCase();
    const cleanName = customName.trim() || cleanEmail.split("@")[0];
    handleSelectAccount(cleanEmail, cleanName);
  };

  return (
    <>
      {/* Vùng nút đăng nhập Google */}
      <div className="w-full flex flex-col items-center gap-2">
        {/* Nút Google chính thức của Google GIS nếu có Client ID */}
        <div id="google-official-btn" className="w-full flex justify-center empty:hidden"></div>

        {/* Nút Google trực quan */}
        <button
          type="button"
          onClick={handleClickGoogleButton}
          className="w-full py-2.5 px-4 rounded-xl border border-[#DECFC0] dark:border-[#474039] bg-white dark:bg-[#27231F] hover:bg-[#FAF5EE] dark:hover:bg-[#322C27] text-xs font-bold text-[#24170E] dark:text-[#FFF5EA] transition shadow-xs hover:shadow-sm flex items-center justify-center gap-3 cursor-pointer group"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{label}</span>
        </button>
      </div>

      {/* Modal Trình Xác Thực Google Thông Minh (Smart Google Account Modal) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in text-left"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#DECFC0] dark:border-[#474039] shadow-2xl p-6 sm:p-7 space-y-5 text-[#24170E] dark:text-[#F7EFE6] animate-in zoom-in-95 duration-200">
            {/* Header Google */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE0D3] dark:border-[#38332E]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#24170E] dark:text-white">
                    Đăng nhập bằng Google
                  </h3>
                  <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                    Tiếp tục đến <strong className="text-[#C28E58]">MushroomCloud FaaS</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#FAF5EE] dark:bg-[#2A2622] text-[#735843] hover:text-[#24170E] dark:hover:text-white flex items-center justify-center border border-[#DECFC0] dark:border-[#474039] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thông báo lỗi */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Chọn nhanh tài khoản Gmail */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D53] dark:text-[#BFA895] block">
                Chọn tài khoản Gmail sẵn có:
              </span>

              {/* Tài khoản 1: Chủ dự án */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectAccount("leminhtai2222005@gmail.com", "Lê Minh Tài")}
                className="w-full p-3 rounded-2xl border border-[#DECFC0] dark:border-[#474039] bg-[#FAF5EE] dark:bg-[#27231F] hover:border-[#C28E58] hover:bg-white dark:hover:bg-[#322C27] transition flex items-center gap-3 text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B2213] to-[#C28E58] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  T
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-bold text-[#24170E] dark:text-white truncate">
                      Lê Minh Tài
                    </strong>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold shrink-0">
                      Chủ Dự Án
                    </span>
                  </div>
                  <p className="text-[11px] text-[#735843] dark:text-[#BFA895] truncate">
                    leminhtai2222005@gmail.com
                  </p>
                </div>
                <svg className="w-4 h-4 text-[#8C6D53] group-hover:text-[#C28E58] transition-transform group-hover:translate-x-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Tài khoản 2: Khách hàng mẫu */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectAccount("customer.test@gmail.com", "Phạm Minh An")}
                className="w-full p-3 rounded-2xl border border-[#DECFC0] dark:border-[#474039] bg-[#FAF5EE] dark:bg-[#27231F] hover:border-[#C28E58] hover:bg-white dark:hover:bg-[#322C27] transition flex items-center gap-3 text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs font-bold text-[#24170E] dark:text-white truncate">
                      Phạm Minh An
                    </strong>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold shrink-0">
                      Khách Hàng FaaS
                    </span>
                  </div>
                  <p className="text-[11px] text-[#735843] dark:text-[#BFA895] truncate">
                    customer.test@gmail.com
                  </p>
                </div>
                <svg className="w-4 h-4 text-[#8C6D53] group-hover:text-[#C28E58] transition-transform group-hover:translate-x-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Hoặc Nhập Gmail Bất Kỳ */}
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 border-t border-[#EAE0D3] dark:border-[#38332E]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D53] dark:text-[#BFA895] block">
                Hoặc nhập Gmail bất kỳ của bạn:
              </span>

              <div>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (!customName && e.target.value.includes("@")) {
                      const prefix = e.target.value.split("@")[0];
                      setCustomName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
                    }
                  }}
                  placeholder="vidu@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#151210] border border-[#DECFC0] dark:border-[#474039] focus:outline-hidden focus:border-[#C28E58] text-xs font-medium text-[#24170E] dark:text-white transition"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Họ và tên hiển thị (Ví dụ: Nguyễn Văn An)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#151210] border border-[#DECFC0] dark:border-[#474039] focus:outline-hidden focus:border-[#C28E58] text-xs font-medium text-[#24170E] dark:text-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#24170E] to-[#452B1A] dark:from-[#C8955E] dark:to-[#DFB27D] text-white dark:text-[#1E1B18] text-xs font-extrabold shadow-sm hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white dark:border-[#1E1B18] border-t-transparent rounded-full animate-spin" />
                    <span>Đang kết nối Google...</span>
                  </>
                ) : (
                  <span>Tiếp tục đăng nhập với Gmail này →</span>
                )}
              </button>
            </form>

            {/* Hướng Dẫn Cấu Hình Google Client ID Thật */}
            <div className="pt-2 border-t border-[#EAE0D3] dark:border-[#38332E]">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-[#C28E58] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>⚙️ Hướng dẫn liên kết Google Cloud OAuth 2.0 Client ID</span>
                <span>{showGuide ? "▲" : "▼"}</span>
              </button>

              {showGuide && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] text-[11px] text-[#735843] dark:text-[#BFA895] space-y-1.5 animate-in fade-in">
                  <p className="font-bold text-[#4A3222] dark:text-[#E2BA78]">
                    3 bước tạo mã Google Client ID chính thức:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Vào <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">Google Cloud Console</a> &gt; Tạo Credentials &gt; OAuth client ID.</li>
                    <li>Chọn loại <strong>Web application</strong>, thêm <code>http://localhost:3000</code> vào mục <em>Authorized JavaScript origins</em>.</li>
                    <li>Sao chép Client ID và dán vào tệp <code>frontend/.env.local</code>: <br /><code className="text-emerald-700 dark:text-emerald-300 font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com</code></li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
