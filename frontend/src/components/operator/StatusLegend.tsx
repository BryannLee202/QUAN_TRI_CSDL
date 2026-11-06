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
    <ul className="flex flex-wrap gap-4 text-sm text-slate-600">
      {ORDER.map((s) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`inline-block h-4 w-4 rounded ${STATUS_STYLE[s]} animate-none`} />
          {STATUS_LABEL[s]}: <strong>{counts[s]}</strong>
        </li>
      ))}
    </ul>
  );
}