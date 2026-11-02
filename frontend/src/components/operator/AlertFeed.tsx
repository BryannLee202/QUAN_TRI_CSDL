"use client";

import type { AlertItem } from "./types";

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "border-red-300 bg-red-50 text-red-800",
  WARNING: "border-amber-300 bg-amber-50 text-amber-800",
  INFO: "border-sky-300 bg-sky-50 text-sky-800",
};

interface Props {
  alerts: AlertItem[];
  roomLabel: (roomId: number) => string;
  onResolve?: (alertId: number) => void;
}

export default function AlertFeed({ alerts, roomLabel, onResolve }: Props) {
  const unresolved = alerts.filter((a) => !a.isResolved).length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Cảnh báo vi khí hậu</h2>
        <span className="relative text-xl" aria-label={`${unresolved} cảnh báo chưa xử lý`}>
          🔔
          {unresolved > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
              {unresolved}
            </span>
          )}
        </span>
      </header>

      <ul className="max-h-96 space-y-2 overflow-y-auto">
        {alerts.length === 0 && <li className="text-sm text-slate-500">Chưa có cảnh báo nào.</li>}
        {alerts.map((a) => (
          <li
            key={a.alertId}
            className={`rounded-xl border p-3 text-sm ${
              a.isResolved
                ? "border-slate-200 bg-slate-50 text-slate-500"
                : SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.WARNING
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <strong>
                {roomLabel(a.roomId)} · {a.alertType}
              </strong>
              <time className="text-xs opacity-70">
                {new Date(a.alertTime).toLocaleTimeString("vi-VN")}
              </time>
            </div>
            <p className="mt-1">{a.message}</p>
            {!a.isResolved && onResolve && (
              <button
                type="button"
                onClick={() => onResolve(a.alertId)}
                className="mt-2 rounded-full border border-current px-3 py-0.5 text-xs font-medium hover:bg-white/60"
              >
                Đánh dấu đã xử lý
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}