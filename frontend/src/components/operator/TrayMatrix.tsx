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
    return <p className="text-sm text-slate-500">Buồng này chưa có khay nào.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${racks}, minmax(56px, 1fr))` }}
      >
        {Array.from({ length: shelves }).flatMap((_, s) =>
          Array.from({ length: racks }).map((__, r) => {
            const tray = byPos.get(`${r + 1}-${s + 1}`);
            if (!tray) return <div key={`empty-${r}-${s}`} />;
            const ui = toUiStatus(tray.status, roomHasAlert);
            return (
              <button
                key={tray.trayId}
                type="button"
                title={`${tray.trayCode} · ${STATUS_LABEL[ui]}`}
                onClick={() => onSelectTray?.(tray)}
                className={`flex h-14 items-center justify-center rounded-lg text-xs font-medium transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${STATUS_STYLE[ui]}`}
              >
                R{tray.rackNumber}-{tray.shelfLevel}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}