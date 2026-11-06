"use client";

import Switch from "./Switch";
import type { DeviceState } from "./types";

export const DEVICES = [
  { type: "EXHAUST_FAN", label: "Quạt hút khí CO₂", hint: "Giảm nồng độ CO₂ trong buồng" },
  { type: "MISTING_SYSTEM", label: "Máy phun sương", hint: "Tăng độ ẩm trong buồng" },
] as const;

interface Props {
  roomId: number;
  devices: Record<string, DeviceState>;
  onToggle: (deviceType: string, next: boolean) => void;
}

export default function HardwareControls({ roomId, devices, onToggle }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold text-slate-800">Điều khiển thiết bị</h2>
      <ul className="space-y-4">
        {DEVICES.map((d) => {
          const state = devices[`${roomId}:${d.type}`];
          const on = state?.on ?? false;
          return (
            <li key={d.type} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">{d.label}</p>
                <p className="text-xs text-slate-500">{d.hint}</p>
                {state?.triggeredBy && (
                  <p className="mt-1 text-xs text-slate-400">
                    {state.actionState ? `${state.actionState} · ` : ""}Lệnh gần nhất bởi: {state.triggeredBy}
                  </p>
                )}
              </div>
              <Switch checked={on} label={d.label} onChange={(next) => onToggle(d.type, next)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}