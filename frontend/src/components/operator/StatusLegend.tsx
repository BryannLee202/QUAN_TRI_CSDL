"use client";

import { useMemo } from "react";
import { STATUS_LABEL, toUiStatus } from "./trayStatus";
import type { TrayCell, TrayUiStatus } from "./types";

interface Props {
  trays: TrayCell[];
  roomHasAlert: boolean;
  selectedFilter?: "ALL" | TrayUiStatus;
  onSelectFilter?: (filter: "ALL" | TrayUiStatus) => void;
}

const ORDER: TrayUiStatus[] = ["active", "alert", "maintenance", "empty"];

const DOT_COLOR: Record<TrayUiStatus, string> = {
  active: "bg-emerald-500",
  alert: "bg-red-500 animate-pulse",
  maintenance: "bg-[#8A5C38]",
  empty: "bg-[#D9C8B5] dark:bg-[#543825] border border-[#8C6D53]",
};

export default function StatusLegend({
  trays,
  roomHasAlert,
  selectedFilter = "ALL",
  onSelectFilter,
}: Props) {
  const counts = useMemo(() => {
    const c: Record<TrayUiStatus, number> = { active: 0, alert: 0, maintenance: 0, empty: 0 };
    for (const t of trays) c[toUiStatus(t.status, roomHasAlert)] += 1;
    return c;
  }, [trays, roomHasAlert]);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
      <button
        type="button"
        onClick={() => onSelectFilter?.("ALL")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer tabular-nums ${
          selectedFilter === "ALL"
            ? "bg-[#24170E] text-white border-[#C28E58] dark:bg-[#C28E58] dark:text-[#170E08] shadow-2xs"
            : "bg-[#FAF5EE] dark:bg-[#27231F] text-[#523522] dark:text-[#DAC7B5] border-[#E8DCCE] dark:border-[#474039] hover:border-[#C28E58]"
        }`}
      >
        <span>Tất cả:</span>
        <strong>{trays.length}</strong>
      </button>

      {ORDER.map((s) => {
        const isSelected = selectedFilter === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelectFilter?.(isSelected ? "ALL" : s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer tabular-nums ${
              isSelected
                ? "bg-[#24170E] text-white border-[#C28E58] dark:bg-[#C28E58] dark:text-[#170E08] font-bold shadow-2xs"
                : "bg-[#FAF5EE] dark:bg-[#27231F] text-[#6B513E] dark:text-[#C5B09E] border-[#E8DCCE] dark:border-[#474039] hover:border-[#C28E58]"
            }`}
          >
            <span className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${DOT_COLOR[s]}`} />
            <span className="font-medium">{STATUS_LABEL[s]}:</span>
            <strong className={isSelected ? "text-white dark:text-[#170E08]" : "text-[#24170E] dark:text-[#FFF5EA]"}>
              {counts[s]}
            </strong>
          </button>
        );
      })}
    </div>
  );
}
