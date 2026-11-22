"use client";

import type { RoomOption } from "./types";

interface Props {
  rooms: RoomOption[];
  selectedRoomId: number;
  alertRoomIds: Set<number>;
  onSelect: (roomId: number) => void;
}

export default function RoomTabs({ rooms, selectedRoomId, alertRoomIds, onSelect }: Props) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2.5">
      {rooms.map((r) => {
        const active = r.roomId === selectedRoomId;
        const hasAlert = alertRoomIds.has(r.roomId);
        return (
          <button
            key={r.roomId}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(r.roomId)}
            className={`relative rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
              active
                ? "bg-gradient-to-r from-[#6B442C] to-[#543522] text-[#FFF5EA] shadow-sm border border-[#C28E58]"
                : "bg-[#FAF5EE] dark:bg-[#27231F] text-[#523522] dark:text-[#D4AF7A] border border-[#DECFC0] dark:border-[#3D281B] hover:bg-[#F2E8DC] dark:hover:bg-[#3C3630]"
            }`}
          >
            <span>{r.roomCode}</span>
            {hasAlert && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}