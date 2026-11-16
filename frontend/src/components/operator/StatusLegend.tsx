"use client";

import { useMemo } from "react";
import { STATUS_LABEL, STATUS_STYLE, toUiStatus } from "./trayStatus";
import type { TrayCell, TrayUiStatus } from "./types";

interface Props {
  trays: TrayCell[];
  roomHasAlert: boolean;
}

const ORDER: TrayUiStatus[] = ["active", "alert", "maintenance", "empty"];

export default function StatusLegend({ trays, roomHasAlert }: Props) {
  const counts = useMemo(() => {
    const c: Record<TrayUiStatus, number> = { active: 0, alert: 0, maintenance: 0, empty: 0 };
    for (const t of trays) c[toUiStatus(t.status, roomHasAlert)] += 1;
    return c;
  }, [trays, roomHasAlert]);

  return (
    <ul className="flex flex-wrap items-center gap-3 text-xs text-[#6B513E] dark:text-[#C5B09E] pt-1">
      {ORDER.map((s) => (
        <li key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF5EE] dark:bg-[#1C120C] border border-[#E8DCCE] dark:border-[#38261A]">
          <span className={`inline-block h-3 w-3 rounded-full ${STATUS_STYLE[s]} animate-none`} />
          <span className="font-medium">{STATUS_LABEL[s]}:</span>
          <strong className="text-[#24170E] dark:text-[#FFF5EA]">{counts[s]}</strong>
        </li>
      ))}
    </ul>
  );
}