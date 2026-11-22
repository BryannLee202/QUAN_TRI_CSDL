"use client";

import type { AlertItem } from "./types";

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "border-rose-300 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200",
  WARNING: "border-amber-300 dark:border-amber-900 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200",
  INFO: "border-[#C28E58]/40 bg-[#FAF5EE] dark:bg-[#27231F] text-[#523522] dark:text-[#E2BA78]",
};

interface Props {
  alerts: AlertItem[];
  roomLabel: (roomId: number) => string;
  onResolve?: (alertId: number) => void;
}

export default function AlertFeed({ alerts, roomLabel, onResolve }: Props) {
  const unresolved = alerts.filter((a) => !a.isResolved).length;

  return (
    <section className="rounded-2xl border border-[#E0D3C1] dark:border-[#474039] bg-white dark:bg-[#27231F] p-5 shadow-sm transition-colors">
      <header className="mb-4 flex items-center justify-between pb-3 border-b border-[#F0E6D8] dark:border-[#2D1D13]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] flex items-center justify-center text-[#C28E58]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">Cảnh Báo Vi Khí Hậu</h2>
            <p className="text-[11px] text-[#735843] dark:text-[#BFA895]">Thời gian thực từ cảm biến IoT buồng nuôi</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] text-xs font-semibold text-[#523522] dark:text-[#E2BA78]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{unresolved} đang xử lý</span>
        </div>
      </header>

      <ul className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
        {alerts.length === 0 && (
          <li className="text-xs text-[#8C6D53] dark:text-[#B9ADA1] py-4 text-center">
            Hệ thống vi khí hậu ổn định, không có cảnh báo nào.
          </li>
        )}
        {alerts.map((a) => (
          <li
            key={a.alertId}
            className={`rounded-xl border p-3.5 text-xs transition-all ${
              a.isResolved
                ? "border-[#E8DCCE] dark:border-[#2D1D13] bg-[#FAF7F2] dark:bg-[#1E1B18] text-[#8C6D53] dark:text-[#7A6455] opacity-75"
                : SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.WARNING
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <strong className="font-bold tracking-tight">
                {roomLabel(a.roomId)} · {a.alertType}
              </strong>
              <time className="text-[10px] font-mono opacity-80">
                {new Date(a.alertTime).toLocaleTimeString("vi-VN")}
              </time>
            </div>
            <p className="leading-relaxed text-[11px]">{a.message}</p>
            {!a.isResolved && onResolve && (
              <div className="mt-2.5 pt-2 border-t border-current/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => onResolve(a.alertId)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/90 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 border border-current/30 px-3 py-1 text-[11px] font-bold shadow-2xs transition-transform active:scale-95"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Đánh dấu đã xử lý
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}