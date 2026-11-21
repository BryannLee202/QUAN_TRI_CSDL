"use client";

import { useMemo } from "react";
import { STATUS_LABEL, toUiStatus } from "./trayStatus";
import type { TrayCell, TrayUiStatus } from "./types";

interface Props {
  trays: TrayCell[];
  roomId: number;
  roomHasAlert: boolean;
  statusFilter?: "ALL" | TrayUiStatus;
  onSelectTray?: (tray: TrayCell) => void;
}

const CARD_STYLE: Record<TrayUiStatus, string> = {
  active:
    "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-500/80 shadow-sm shadow-emerald-950/15",
  alert:
    "bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white border-rose-400/80 shadow-sm shadow-rose-950/20",
  maintenance:
    "bg-gradient-to-br from-[#8A5C38] to-[#6E472A] hover:from-[#9A6842] hover:to-[#7A5030] text-white border-[#C28E58]/60 shadow-sm",
  empty:
    "bg-[#FAF5EE] dark:bg-[#1B120C] hover:bg-[#F3EAE0] dark:hover:bg-[#241810] text-[#3B2516] dark:text-[#E8DCCE] border-[#DECFC0] dark:border-[#3D271A] hover:border-[#C28E58]",
};

const BADGE_STYLE: Record<TrayUiStatus, string> = {
  active: "bg-white/20 text-white border border-white/25",
  alert: "bg-white/20 text-white border border-white/30",
  maintenance: "bg-black/25 text-[#F5E6D0] border border-white/15",
  empty: "bg-white dark:bg-[#281A11] text-[#7A5B43] dark:text-[#C28E58] border border-[#DECFC0] dark:border-[#4A3222]",
};

/**
 * Rút gọn mã khay dài (ví dụ 'TRAY-RM01-R01-01') thành định danh ngắn gọn, logic ('R01-01')
 * tránh lặp lại tiền tố 'TRAY-RM01-' gây tràn dòng.
 */
function formatShortTrayId(tray: TrayCell): string {
  const raw = (tray.trayCode || "").trim();
  const match = raw.match(/R\d{1,2}-\d{1,3}$/i);
  if (match) {
    return match[0].toUpperCase();
  }
  const r = String(tray.rackNumber || 1).padStart(2, "0");
  const s = String(tray.positionNumber || tray.shelfLevel || 1).padStart(2, "0");
  return `R${r}-${s}`;
}

export default function TrayMatrix({
  trays,
  roomId,
  roomHasAlert,
  statusFilter = "ALL",
  onSelectTray,
}: Props) {
  const filteredTrays = useMemo(() => {
    const inRoom = trays
      .filter((t) => t.roomId === roomId)
      .sort((a, b) => {
        if (a.rackNumber !== b.rackNumber) return a.rackNumber - b.rackNumber;
        if (a.shelfLevel !== b.shelfLevel) return a.shelfLevel - b.shelfLevel;
        return (a.positionNumber || 0) - (b.positionNumber || 0);
      });

    if (statusFilter === "ALL") return inRoom;
    return inRoom.filter((t) => toUiStatus(t.status, roomHasAlert) === statusFilter);
  }, [trays, roomId, roomHasAlert, statusFilter]);

  if (filteredTrays.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#8C6D53] dark:text-[#A8907E] rounded-2xl border border-dashed border-[#DECFC0] dark:border-[#38261A]">
        Không có khay nuôi nào thuộc trạng thái đang lọc trong buồng này.
      </div>
    );
  }

  return (
    <div className="pt-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredTrays.map((tray) => {
          const ui = toUiStatus(tray.status, roomHasAlert);
          const shortId = formatShortTrayId(tray);
          const rackPad = String(tray.rackNumber).padStart(2, "0");
          const shelfPad = String(tray.shelfLevel).padStart(2, "0");

          const subInfo =
            ui === "empty"
              ? "Khay trống • Sẵn sàng"
              : ui === "maintenance"
              ? "Khử khuẩn & Bảo dưỡng"
              : tray.speciesName
              ? tray.speciesName
              : tray.orderCode
              ? `HĐ: ${tray.orderCode}`
              : "Đang nuôi chu kỳ FaaS";

          return (
            <button
              key={tray.trayId}
              type="button"
              title={`Mã QR: ${tray.trayCode} • Kệ ${rackPad} - Tầng ${shelfPad} • ${STATUS_LABEL[ui]}`}
              onClick={() => onSelectTray?.(tray)}
              className={`group rounded-2xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C28E58] flex flex-col justify-between min-h-[88px] cursor-pointer ${CARD_STYLE[ui]}`}
            >
              {/* Dòng 1: Mã Khay Ngắn Gọn & Nhãn Trạng Thái (Không rớt dòng) */}
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span className="text-xs font-extrabold tracking-tight whitespace-nowrap tabular-nums">
                  Khay {shortId}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${BADGE_STYLE[ui]}`}>
                  {STATUS_LABEL[ui]}
                </span>
              </div>

              {/* Dòng 2 & 3: Vị Trí Vật Lý (Kệ - Tầng) & Thông Tin Chi Tiết */}
              <div className="mt-2.5 pt-2 border-t border-current/15 w-full space-y-0.5">
                <div className="text-[11px] font-bold tracking-tight whitespace-nowrap tabular-nums opacity-95">
                  Kệ {rackPad} • Tầng {shelfPad}
                </div>
                <div className="text-[10px] font-medium truncate opacity-80">
                  {subInfo}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
