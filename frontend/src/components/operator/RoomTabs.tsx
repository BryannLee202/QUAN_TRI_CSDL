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
    <div role="tablist" className="flex gap-2">
      {rooms.map((r) => {
        const active = r.roomId === selectedRoomId;
        return (
          <button
            key={r.roomId}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(r.roomId)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? "bg-[#0D5C3A] text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            {r.roomCode}
            {alertRoomIds.has(r.roomId) && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}