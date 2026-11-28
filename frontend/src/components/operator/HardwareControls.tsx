"use client";

import Switch from "./Switch";
import IoTDeviceStatusBadge from "./IoTDeviceStatusBadge";
import type { DeviceState } from "./types";

export const DEVICES = [
  {
    type: "EXHAUST_FAN",
    label: "Quạt hút khí CO₂",
    hint: "Lưu chuyển luồng khí sạch và xả CO₂ dư thừa",
    icon: (
      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12c0 3-2.5 5.5-5.5 5.5S12 15 12 12Z"/>
        <path d="M12 12c-3 0-5.5-2.5-5.5-5.5S9 1 12 1c3 0 5.5 2.5 5.5 5.5S15 12 12 12Z"/>
        <path d="M12 12c0 3-2.5 5.5-5.5 5.5S1 15 1 12c0-3 2.5-5.5 5.5-5.5S12 9 12 12Z"/>
        <path d="M12 12c3 0 5.5 2.5 5.5 5.5S15 23 12 23c-3 0-5.5-2.5-5.5-5.5S9 12 12 12Z"/>
      </svg>
    ),
  },
  {
    type: "MISTING_SYSTEM",
    label: "Máy phun sương siêu âm",
    hint: "Bù ẩm hạt nano đảm bảo độ ẩm 85% - 95%",
    icon: (
      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6"/>
        <path d="m4.93 10.93 4.24-4.24"/>
        <path d="M2 18h6"/>
        <path d="M20 18h2"/>
        <path d="m19.07 10.93-4.24-4.24"/>
        <path d="M22 22H2"/>
        <path d="m16 16-4-4-4 4"/>
      </svg>
    ),
  },
  {
    type: "GROW_LIGHT",
    label: "Đèn chiếu sáng (LED)",
    hint: "LED mô phỏng đèn quang phổ, chỉ bật/tắt bằng tay",
    icon: (
      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
        <path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2Z"/>
      </svg>
    ),
  },
  {
    type: "HEATER",
    label: "Sưởi ấm (LED)",
    hint: "LED mô phỏng sưởi, tự bật khi nhiệt độ dưới ngưỡng tối thiểu",
    icon: (
      <svg className="w-4 h-4 text-[#C28E58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
      </svg>
    ),
  },
] as const;

interface Props {
  roomId: number;
  devices: Record<string, DeviceState>;
  onToggle: (deviceType: string, next: boolean) => void;
}

export default function HardwareControls({ roomId, devices, onToggle }: Props) {
  return (
    <section className="rounded-2xl border border-[#E0D3C1] dark:border-[#474039] bg-white dark:bg-[#27231F] p-5 shadow-sm transition-colors">
      <header className="mb-4 flex items-center justify-between pb-3 border-b border-[#F0E6D8] dark:border-[#2D1D13]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] flex items-center justify-center text-[#C28E58]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
              <rect x="9" y="9" width="6" height="6"/>
              <line x1="9" y1="1" x2="9" y2="4"/>
              <line x1="15" y1="1" x2="15" y2="4"/>
              <line x1="9" y1="20" x2="9" y2="23"/>
              <line x1="15" y1="20" x2="15" y2="23"/>
              <line x1="20" y1="9" x2="23" y2="9"/>
              <line x1="20" y1="14" x2="23" y2="14"/>
              <line x1="1" y1="9" x2="4" y2="9"/>
              <line x1="1" y1="14" x2="4" y2="14"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">Điều Khiển Thiết Bị Buồng</h2>
            <p className="text-[11px] text-[#735843] dark:text-[#BFA895]">Can thiệp cưỡng bức rơ-le phần cứng IoT</p>
          </div>
        </div>
        <IoTDeviceStatusBadge roomId={roomId} />
      </header>

      <ul className="space-y-4">
        {DEVICES.map((d) => {
          const state = devices[`${roomId}:${d.type}`];
          const on = state?.on ?? false;
          return (
            <li
              key={d.type}
              className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#FAF5EE]/70 dark:bg-[#1E1B18] border border-[#E8DCCE] dark:border-[#474039] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-[#322D28] border border-[#E0D3C1] dark:border-[#474039] shrink-0 mt-0.5">
                  {d.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-[#24170E] dark:text-[#FFF5EA]">{d.label}</p>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        on
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : "bg-[#EAE0D3] dark:bg-[#322D28] text-[#735843] dark:text-[#B9ADA1]"
                      }`}
                    >
                      {on ? "ĐANG BẬT" : "ĐANG TẮT"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#735843] dark:text-[#BFA895] mt-0.5">{d.hint}</p>
                  {state?.triggeredBy && (
                    <p className="mt-1 text-[10px] font-mono text-[#8C6D53] dark:text-[#8F7766]">
                      Lệnh gần nhất: {state.triggeredBy}
                    </p>
                  )}
                </div>
              </div>
              <Switch checked={on} label={d.label} onChange={(next) => onToggle(d.type, next)} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}