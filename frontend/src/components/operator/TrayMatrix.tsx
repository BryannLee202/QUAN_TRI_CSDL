"use client";

import { useMemo } from "react";
import { STATUS_LABEL, STATUS_STYLE, toUiStatus } from "./trayStatus";
import type { TrayCell } from "./types";

interface Props {
  trays: TrayCell[];
  roomId: number;
  roomHasAlert: boolean;
  onSelectTray?: (tray: TrayCell) => void;
}

export default function TrayMatrix({ trays, roomId, roomHasAlert, onSelectTray }: Props) {
  const inRoom = useMemo(() => trays.filter((t) => t.roomId === roomId), [trays, roomId]);

  const { racks, shelves, byPos } = useMemo(() => {
    const byPos = new Map<string, TrayCell>();
    let racks = 0;
    let shelves = 0;
    for (const t of inRoom) {
      byPos.set(`${t.rackNumber}-${t.shelfLevel}`, t);
      racks = Math.max(racks, t.rackNumber);
      shelves = Math.max(shelves, t.shelfLevel);
    }
    return { racks, shelves, byPos };
  }, [inRoom]);

  if (inRoom.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-[#8C6D53] dark:text-[#A8907E]">
        Buồng này chưa có khay nuôi nào trong cơ sở dữ liệu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pt-2">
      <div
        className="grid gap-2.5 min-w-[360px]"
        style={{ gridTemplateColumns: `repeat(${Math.max(racks, 1)}, minmax(64px, 1fr))` }}
      >
        {Array.from({ length: shelves }).flatMap((_, s) =>
          Array.from({ length: racks }).map((__, r) => {
            const tray = byPos.get(`${r + 1}-${s + 1}`);
            if (!tray) return <div key={`empty-${r}-${s}`} className="h-14 rounded-xl border border-dashed border-[#E0D3C1]/50 dark:border-[#38261A]/50 bg-transparent" />;
            const ui = toUiStatus(tray.status, roomHasAlert);
            return (
              <button
                key={tray.trayId}
                type="button"
                title={`${tray.trayCode} (${tray.speciesName || "Trống"}) · ${STATUS_LABEL[ui]}`}
                onClick={() => onSelectTray?.(tray)}
                className={`group flex flex-col h-14 items-center justify-center rounded-xl p-1 text-xs font-bold transition-all duration-200 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C28E58] shadow-2xs ${STATUS_STYLE[ui]}`}
              >
                <span className="text-[11px] tracking-tight">{tray.trayCode}</span>
                <span className="text-[9px] opacity-85 font-mono uppercase">
                  {tray.speciesName ? tray.speciesName.split(" ")[0] : `R${tray.rackNumber}-${tray.shelfLevel}`}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}